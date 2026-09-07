import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import {
  createGroqProvider,
  TEXT_MODEL,
  VISION_MODEL,
} from "./ai-gateway.server";
import {
  extractFeatures,
  lightweightCredibility,
} from "./linguistics";
import {
  webSearch,
  type SearchHit,
} from "./web-search.server";
import {
  recommendationFor,
  riskLevelFor,
  type AnalysisResult,
  type ClaimCheck,
  type FactCheckResult,
  type ImageAnalysis,
  type SourceCredibility,
  type TextAnalysis,
  type Verdict,
} from "./analysis-types";

/* ------------------------------------------------------------------ */
/* AI GATEWAY                                                         */
/* ------------------------------------------------------------------ */

function gateway() {
  const apiKey = process.env["GROQ_API_KEY"];

  if (!apiKey) {
    console.warn(
      "[gateway] GROQ_API_KEY is not configured.",
    );

    return null;
  }

  try {
    const model = createGroqProvider(apiKey);

    return {
      model,
      textModel: TEXT_MODEL,
      visionModel: VISION_MODEL,
      kind: "groq" as const,
    };
  } catch (err) {
    console.error(
      "[gateway] Failed to create Groq provider:",
      err,
    );

    return null;
  }
}

const clamp = (
  n: number,
  lo = 0,
  hi = 100,
) =>
  Math.max(
    lo,
    Math.min(hi, n),
  );

/* ------------------------------------------------------------------ */
/* 1. TEXT ANALYSIS                                                   */
/* ------------------------------------------------------------------ */

const textSchema = z.object({
  credibility_score: z
    .number()
    .describe(
      "0-100, how credible/likely-authentic the text is. Higher = more credible.",
    ),

  confidence: z
    .number()
    .describe(
      "0-100 confidence in the assessment",
    ),

  sentiment: z
    .string()
    .describe(
      "Short sentiment/tone label, e.g. 'Neutral / factual'",
    ),

  important_tokens: z.array(
    z.object({
      token: z.string(),

      weight: z
        .number()
        .describe(
          "0-1 importance of this token for the decision",
        ),

      direction: z.enum([
        "credible",
        "suspicious",
      ]),
    }),
  ),

  suspicious_phrases:
    z.array(z.string()),

  linguistic_patterns:
    z.array(z.string()),

  claim_indicators:
    z.array(z.string()),

  sensationalism_indicators:
    z.array(z.string()),

  reasoning: z
    .string()
    .describe(
      "2-4 sentences explaining the classification",
    ),
});

export async function analyzeText(
  headline: string,
  content: string,
): Promise<TextAnalysis> {
  const features =
    extractFeatures(
      headline,
      content,
    );

  const lightScore =
    lightweightCredibility(
      features,
    );

  const gw = gateway();

  if (gw) {
    try {
      const result = streamText({
        model: gw.model(
          gw.textModel,
        ),

        output: Output.object({
          schema: textSchema,
        }),

        system:
          "You are the text classification head of TruthGuard AI, a pre-publication fake news detection system. " +
          "Analyze the supplied news headline and article content. " +
          "Assess credibility using factual plausibility, sourcing, attribution, specificity, verifiability, " +
          "sensationalism, clickbait structure, internal consistency, and extraordinary claims. " +
          "Poor grammar, spelling mistakes, awkward phrasing or informal style are NOT evidence of fake news. " +
          "Genuine regional and local reporting may contain imperfect language. " +
          "Never lower credibility merely because English is imperfect. " +
          "Do not invent facts, sources, URLs, quotations or events. " +
          "Important tokens must literally appear in the submitted headline or content. " +
          "A claim that cannot be verified from the supplied text should not automatically be classified as fake. " +
          "Use UNCERTAIN when the linguistic evidence alone is insufficient. " +
          "Give a high score to well-sourced, specific, internally consistent reporting. " +
          "Give a low score only when there are substantial suspicious indicators.",

        prompt:
          `HEADLINE:\n${headline}\n\n` +
          `CONTENT:\n${content || "(no body text supplied)"}\n\n` +
          `DETERMINISTIC FEATURES:\n${JSON.stringify(features)}`,
      });

      const out =
        await result.output;

      const cred =
        clamp(
          out.credibility_score,
        );

      return {
        prediction:
          cred >= 62
            ? "REAL"
            : cred <= 40
              ? "FAKE"
              : "UNCERTAIN",

        confidence:
          clamp(
            out.confidence,
          ),

        credibilityScore:
          cred,

        importantTokens:
          out.important_tokens
            .slice(0, 18)
            .map((t) => ({
              token: t.token,

              weight:
                clamp(
                  t.weight,
                  0,
                  1,
                ),

              direction:
                t.direction,
            })),

        suspiciousPhrases:
          out.suspicious_phrases
            .slice(0, 12),

        sentiment:
          out.sentiment,

        linguisticPatterns:
          out.linguistic_patterns
            .slice(0, 10),

        claimIndicators:
          out.claim_indicators
            .slice(0, 10),

        sensationalismIndicators:
          out.sensationalism_indicators
            .slice(0, 10),

        features,

        mode: "transformer",

        reasoning:
          out.reasoning,
      };
    } catch (err) {
      if (
        NoObjectGeneratedError.isInstance(
          err,
        )
      ) {
        console.warn(
          "[analyzeText] Groq returned an unparsable response. Falling back to lightweight mode.",
        );
      } else {
        console.error(
          "[analyzeText] Groq AI call failed. Falling back to lightweight mode.",
          err,
        );
      }
    }
  } else {
    console.warn(
      "[analyzeText] Groq provider unavailable. Using lightweight mode.",
    );
  }

  /* -------------------------------------------------------------- */
  /* Lightweight fallback                                           */
  /* -------------------------------------------------------------- */

  return {
    prediction:
      lightScore >= 62
        ? "REAL"
        : lightScore <= 40
          ? "FAKE"
          : "UNCERTAIN",

    confidence: 45,

    credibilityScore:
      lightScore,

    importantTokens: [
      ...features.sensationalTerms.map(
        (t) => ({
          token: t,
          weight: 0.8,
          direction:
            "suspicious" as const,
        }),
      ),

      ...features.attributionTerms.map(
        (t) => ({
          token: t,
          weight: 0.6,
          direction:
            "credible" as const,
        }),
      ),
    ].slice(0, 18),

    suspiciousPhrases:
      features.sensationalTerms,

    sentiment:
      "Not assessed (lightweight mode)",

    linguisticPatterns: [
      `Caps ratio ${features.capsRatio}`,
      `${features.exclamationCount} exclamation marks`,
      `${features.wordCount} words`,
    ],

    claimIndicators:
      features.numericClaims
        ? [
            `${features.numericClaims} numeric claim(s)`,
          ]
        : [],

    sensationalismIndicators:
      features.sensationalTerms,

    features,

    mode: "lightweight",

    reasoning:
      "Lightweight Model Mode: the Groq classifier was unavailable, so this score comes from the deterministic lexical/stylistic rule scorer only.",
  };
}

/* ------------------------------------------------------------------ */
/* 2. IMAGE ANALYSIS                                                  */
/* ------------------------------------------------------------------ */

const imageSchema = z.object({
  authenticity_score:
    z
      .number()
      .describe(
        "0-100, higher = looks more authentic/unedited",
      ),

  status: z.enum([
    "AUTHENTIC-LOOKING",
    "SUSPICIOUS",
    "UNABLE TO DETERMINE",
  ]),

  suspicion_level:
    z.string(),

  visual_indicators:
    z.array(z.string()),

  consistency_with_text:
    z.string(),

  explanation:
    z.string(),
});

export async function analyzeImage(
  imageDataUrl: string,
  headline: string,
): Promise<ImageAnalysis> {
  const gw = gateway();

  if (!gw) {
    return {
      available: true,

      status:
        "UNABLE TO DETERMINE",

      score: null,

      suspicionLevel:
        "Unknown",

      indicators: [],

      consistency:
        "Not assessed",

      explanation:
        "Vision model unavailable — image was not analysed.",
    };
  }

  try {
    const result = streamText({
      model: gw.model(
        gw.visionModel,
      ),

      output: Output.object({
        schema: imageSchema,
      }),

      system:
        "You are the computer-vision head of TruthGuard AI. " +
        "Inspect the supplied news image for possible signs of manipulation, " +
        "synthetic generation, editing, cloning, splicing, impossible physics, " +
        "warped text, inconsistent lighting, inconsistent shadows, distorted hands, " +
        "compression artifacts, watermark traces, or recontextualisation. " +
        "Do not claim absolute proof of authenticity or manipulation. " +
        "Report indicators and likelihood only. " +
        "Also assess whether the image plausibly matches the supplied headline.",

      messages: [
        {
          role: "user",

          content: [
            {
              type: "text",

              text:
                `Headline the image accompanies:\n${headline}`,
            },

            {
              type: "image",

              image:
                imageDataUrl,
            },
          ],
        },
      ],
    });

    const out =
      await result.output;

    return {
      available: true,

      status: out.status,

      score:
        clamp(
          out.authenticity_score,
        ),

      suspicionLevel:
        out.suspicion_level,

      indicators:
        out.visual_indicators
          .slice(0, 10),

      consistency:
        out.consistency_with_text,

      explanation:
        out.explanation,
    };
  } catch (err) {
    console.error(
      "[analyzeImage]",
      err,
    );

    return {
      available: true,

      status:
        "UNABLE TO DETERMINE",

      score: null,

      suspicionLevel:
        "Unknown",

      indicators: [],

      consistency:
        "Not assessed",

      explanation:
        "The image could not be analysed by the vision model.",
    };
  }
}

export const NO_IMAGE:
  ImageAnalysis = {
    available: false,

    status:
      "UNABLE TO DETERMINE",

    score: null,

    suspicionLevel:
      "Not Available",

    indicators: [],

    consistency:
      "Not Available",

    explanation:
      "Image Analysis: Not Available — no image was supplied.",
  };

/* ------------------------------------------------------------------ */
/* 3. FACT VERIFICATION                                               */
/* ------------------------------------------------------------------ */

const claimsSchema = z.object({
  claims: z
    .array(z.string())
    .describe(
      "2 to 4 short, concrete and checkable factual claims",
    ),

  search_queries:
    z
      .array(z.string())
      .describe(
        "2 to 6 concise searches that can verify the claims",
      ),
});

const verdictSchema = z.object({
  results: z.array(
    z.object({
      claim: z.string(),

      status: z.enum([
        "SUPPORTED",
        "CONTRADICTED",
        "UNVERIFIED",
      ]),

      evidence: z
        .string()
        .describe(
          "Quote or paraphrase strictly from the supplied search snippets",
        ),

      source_index:
        z
          .number()
          .describe(
            "1-based index of supplied source, or 0 if none",
          ),

      relevance:
        z
          .number()
          .describe(
            "0-100 relevance of the supplied source to the claim",
          ),
    }),
  ),
});

export async function factCheck(
  headline: string,
  content: string,
): Promise<FactCheckResult> {
  const gw = gateway();

  const unavailable = (
    msg: string,
  ): FactCheckResult => ({
    available: false,

    message: msg,

    claims: [],

    evidenceScore: null,

    searchedQueries: [],
  });

  if (!gw) {
    console.warn(
      "[factCheck] Groq provider unavailable — external verification skipped.",
    );

    return unavailable(
      "External verification unavailable.",
    );
  }

  let claims: string[] = [];

  let suggestedQueries:
    string[] = [];

  /* -------------------------------------------------------------- */
  /* Extract claims                                                  */
  /* -------------------------------------------------------------- */

  try {
    const r = streamText({
      model: gw.model(
        gw.textModel,
      ),

      output: Output.object({
        schema: claimsSchema,
      }),

      system:
        "Extract concrete, checkable factual claims from the supplied news item. " +
        "Produce targeted web searches that can verify those exact claims. " +
        "Each claim must be a short sentence that can be checked against public reporting. " +
        "Preserve the exact person, office, date, event, place and tense from the input. " +
        "Do not broaden a specific claim. " +
        "Do not create facts that are not present in the input. " +
        "Do not duplicate claims.",

      prompt:
        `HEADLINE:\n${headline}\n\nCONTENT:\n${content}`,
    });

    const extracted =
      await r.output;

    if (
      content.length === 0 &&
      headline.length > 0 &&
      headline.length <= 500
    ) {
      claims = [
        headline,
      ];
    } else {
      claims =
        extracted.claims
          .slice(0, 4);
    }

    suggestedQueries =
      extracted.search_queries
        .slice(0, 6);
  } catch (err) {
    console.error(
      "[factCheck:claims]",
      err,
    );

    return unavailable(
      "External verification unavailable.",
    );
  }

  if (
    claims.length === 0
  ) {
    return unavailable(
      "No checkable factual claims were extracted.",
    );
  }

  /* -------------------------------------------------------------- */
  /* Search externally                                               */
  /* -------------------------------------------------------------- */

  const queries = [
    headline,
    ...claims,
    ...suggestedQueries,
  ];

  const searched:
    string[] = [];

  const hits:
    SearchHit[] = [];

  for (
    const q of queries
  ) {
    const trimmed =
      q.trim();

    if (!trimmed) {
      continue;
    }

    if (
      !searched.includes(
        trimmed,
      )
    ) {
      searched.push(
        trimmed,
      );
    }

    try {
      const found =
        await webSearch(
          trimmed,
          4,
        );

      for (
        const h of found
      ) {
        if (
          !hits.some(
            (x) =>
              x.url === h.url,
          )
        ) {
          hits.push(h);
        }
      }
    } catch (err) {
      console.error(
        "[factCheck:search] Web search failed:",
        err,
      );
    }
  }

  /* -------------------------------------------------------------- */
  /* No evidence                                                     */
  /* -------------------------------------------------------------- */

  if (
    hits.length === 0
  ) {
    return {
      available: false,

      message:
        "External verification unavailable — no search results could be retrieved.",

      claims:
        claims.map(
          (claim) => ({
            claim,

            status:
              "UNVERIFIED" as const,

            evidence:
              "No retrieved evidence.",

            sourceTitle:
              null,

            sourceUrl:
              null,

            relevance:
              0,
          }),
        ),

      evidenceScore:
        null,

      searchedQueries:
        searched,
    };
  }

  /* -------------------------------------------------------------- */
  /* Build source context                                           */
  /* -------------------------------------------------------------- */

  const sourceList =
    hits
      .map(
        (h, i) =>
          `[${i + 1}] ${h.title}\n` +
          `URL: ${h.url}\n` +
          `SNIPPET: ${h.snippet}`,
      )
      .join("\n\n");

  /* -------------------------------------------------------------- */
  /* Verify claims with Groq                                        */
  /* -------------------------------------------------------------- */

  try {
    const r = streamText({
      model: gw.model(
        gw.textModel,
      ),

      system:
        "You are the evidence verification head of TruthGuard AI. " +
        "You must evaluate the supplied claims using ONLY the retrieved sources. " +
        "Do not use outside knowledge. " +
        "Do not invent facts, sources, URLs, quotations or evidence. " +
        "Evaluate the exact person, office, place, event, date and tense stated in each claim. " +
        "A search result title alone is not enough if the snippet does not actually resolve the claim. " +
        "Prefer official government sources and established news reporting. " +
        "If reliable retrieved evidence clearly supports the claim, return SUPPORTED. " +
        "If reliable retrieved evidence clearly contradicts the claim, return CONTRADICTED. " +
        "If evidence is insufficient or conflicting, return UNVERIFIED. " +
        "Use source_index 0 when no supplied source actually resolves the claim. " +
        "Evidence must only describe information present in the supplied snippets. " +
        "Return ONLY valid JSON. Do not use markdown fences.",

      prompt:
        `Return a JSON object with exactly this structure:

{
  "results": [
    {
      "claim": "string",
      "status": "SUPPORTED",
      "evidence": "string",
      "source_index": 1,
      "relevance": 75
    }
  ]
}

Rules:
- "status" must be exactly SUPPORTED, CONTRADICTED, or UNVERIFIED.
- "source_index" must be 0 or the 1-based index of a supplied source.
- "relevance" must be an integer from 0 to 100.
- "evidence" must only describe evidence contained in the supplied sources.
- Include one result for each supplied claim.
- Do not invent evidence.
- If no source resolves a claim, use UNVERIFIED, source_index 0, and relevance 0.

CLAIMS:
${claims
  .map(
    (claim, i) =>
      `${i + 1}. ${claim}`,
  )
  .join("\n")}

RETRIEVED SOURCES:
${sourceList}`,
    });

    const raw =
      await r.text;

    let parsed:
      unknown;

    try {
      parsed =
        JSON.parse(raw);
    } catch {
      console.error(
        "[factCheck:verify] Groq returned invalid JSON:",
        raw,
      );

      return unavailable(
        "External verification unavailable — AI verification returned invalid JSON.",
      );
    }

    const validated =
      verdictSchema.safeParse(
        parsed,
      );

    if (
      !validated.success
    ) {
      console.error(
        "[factCheck:verify] Groq JSON failed schema validation:",
        validated.error,
      );

      return unavailable(
        "External verification unavailable — AI verification returned an invalid result.",
      );
    }

    const out =
      validated.data;

    const results:
      ClaimCheck[] =
      out.results.map(
        (x) => {
          const hit =
            x.source_index >= 1 &&
            x.source_index <= hits.length
              ? hits[
                  x.source_index - 1
                ]
              : undefined;

          return {
            claim:
              x.claim,

            status:
              x.status,

            evidence:
              x.evidence,

            sourceTitle:
              hit?.title ??
              null,

            sourceUrl:
              hit?.url ??
              null,

            relevance:
              clamp(
                x.relevance,
              ),
          };
        },
      );

    const supported =
      results.filter(
        (r2) =>
          r2.status ===
          "SUPPORTED",
      ).length;

    const contradicted =
      results.filter(
        (r2) =>
          r2.status ===
          "CONTRADICTED",
      ).length;

    const total =
      results.length;

    const evidenceScore =
      total === 0
        ? null
        : clamp(
            Math.round(
              (
                supported * 100 +
                (
                  total -
                  supported -
                  contradicted
                ) *
                  50
              ) /
                total,
            ),
          );

    return {
      available: true,

      message:
        "External verification completed.",

      claims:
        results,

      evidenceScore,

      searchedQueries:
        searched,
    };
  } catch (err) {
    console.error(
      "[factCheck:verify]",
      err,
    );

    return unavailable(
      "External verification unavailable.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* 4. SOURCE CREDIBILITY                                              */
/* ------------------------------------------------------------------ */

const HIGH_TRUST = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "nytimes.com",
  "theguardian.com",
  "npr.org",
  "thehindu.com",
  "indianexpress.com",
  "ndtv.com",
  "nature.com",
  "science.org",
  "who.int",
  "nasa.gov",
  "pib.gov.in",
];

export function assessSource(
  input: {
    sourceUrl?:
      string | null;

    sourceName?:
      string | null;

    author?:
      string | null;

    publicationDate?:
      string | null;
  },
): SourceCredibility {
  const notes:
    string[] = [];

  let domain:
    string | null = null;

  let https:
    boolean | null = null;

  let score = 50;

  if (
    input.sourceUrl
  ) {
    try {
      const u =
        new URL(
          input.sourceUrl,
        );

      domain =
        u.hostname.replace(
          /^www\./,
          "",
        );

      https =
        u.protocol ===
        "https:";

      score +=
        https
          ? 6
          : -12;

      notes.push(
        https
          ? "Served over HTTPS."
          : "Not served over HTTPS.",
      );

      if (
        HIGH_TRUST.some(
          (d) =>
            domain === d ||
            domain!.endsWith(
              "." + d,
            ),
        )
      ) {
        score += 26;

        notes.push(
          "Domain is on the established-newsroom reference list.",
        );
      } else if (
        /\.(gov|edu|int)(\.|$)/.test(
          domain,
        ) ||
        domain.endsWith(
          ".gov.in",
        )
      ) {
        score += 20;

        notes.push(
          "Official government or academic domain.",
        );
      } else if (
        /(blogspot|wordpress|medium|substack|weebly|wixsite)\./.test(
          domain,
        )
      ) {
        score -= 12;

        notes.push(
          "Self-publishing platform — no editorial gatekeeping implied.",
        );
      } else {
        notes.push(
          "Domain not on the reference list; credibility unknown.",
        );
      }

      if (
        /(\.xyz|\.top|\.click|\.buzz|news\d+|-news24|dailyviral)/.test(
          domain,
        )
      ) {
        score -= 18;

        notes.push(
          "Domain pattern is common among low-quality content farms.",
        );
      }
    } catch {
      notes.push(
        "Source URL could not be parsed.",
      );

      score -= 5;
    }
  } else {
    notes.push(
      "No source URL provided.",
    );

    score -= 8;
  }

  if (
    input.sourceName
  ) {
    score += 4;
  } else {
    notes.push(
      "No source name provided.",
    );
  }

  if (
    input.publicationDate
  ) {
    score += 4;
  } else {
    notes.push(
      "No publication date provided.",
    );
  }

  return {
    domain,

    https,

    sourceName:
      input.sourceName ??
      null,

    author:
      input.author ??
      null,

    publicationDate:
      input.publicationDate ??
      null,

    score:
      clamp(
        Math.round(score),
      ),

    notes,
  };
}

/* ------------------------------------------------------------------ */
/* 5. MULTIMODAL FUSION                                               */
/* ------------------------------------------------------------------ */

export function fuse(
  text: TextAnalysis,

  image: ImageAnalysis,

  fact: FactCheckResult,

  source: SourceCredibility,
) {
  const parts: {
    key: string;
    score: number;
    weight: number;
  }[] = [
    {
      key: "text",

      score:
        text.credibilityScore,

      weight: 0.2,
    },
  ];

  if (
    image.available &&
    image.score !== null
  ) {
    parts.push({
      key: "image",

      score:
        image.score,

      weight: 0.15,
    });
  }

  if (
    fact.available &&
    fact.evidenceScore !==
      null
  ) {
    parts.push({
      key: "evidence",

      score:
        fact.evidenceScore,

      weight: 0.45,
    });
  }

  if (
    source.score !== null
  ) {
    parts.push({
      key: "source",

      score:
        source.score,

      weight: 0.2,
    });
  }

  const totalWeight =
    parts.reduce(
      (a, p) =>
        a + p.weight,
      0,
    );

  const weights:
    Record<
      string,
      number
    > = {};

  let credibility = 0;

  for (
    const p of parts
  ) {
    const w =
      p.weight /
      totalWeight;

    weights[p.key] =
      +(
        w * 100
      ).toFixed(1);

    credibility +=
      p.score * w;
  }

  credibility =
    Math.round(
      credibility,
    );

  let prediction:
    Verdict =
    credibility >= 62
      ? "REAL"
      : credibility <= 40
        ? "FAKE"
        : "UNCERTAIN";

  /* -------------------------------------------------------------- */
  /* Direct retrieved evidence is decisive                          */
  /* -------------------------------------------------------------- */

  const matchedClaims =
    fact.available
      ? fact.claims.filter(
          (claim) =>
            claim.status !==
              "UNVERIFIED" &&
            claim.sourceUrl !==
              null &&
            claim.relevance >=
              50,
        )
      : [];

  const evidenceDecisive =
    matchedClaims.length >
    0;

  if (
    evidenceDecisive
  ) {
    const hasContradiction =
      matchedClaims.some(
        (claim) =>
          claim.status ===
          "CONTRADICTED",
      );

    prediction =
      hasContradiction
        ? "FAKE"
        : "REAL";

    credibility =
      hasContradiction
        ? Math.min(
            35,
            fact.evidenceScore ??
              20,
          )
        : Math.max(
            65,
            fact.evidenceScore ??
              80,
          );
  }

  /* -------------------------------------------------------------- */
  /* Hard guard                                                      */
  /* -------------------------------------------------------------- */

  const contradicted =
    fact.claims.filter(
      (c) =>
        c.status ===
        "CONTRADICTED",
    ).length;

  let downgraded =
    false;

  if (
    !evidenceDecisive &&
    prediction === "FAKE" &&
    contradicted === 0
  ) {
    prediction =
      "UNCERTAIN";

    downgraded =
      true;
  }

  const riskScore =
    clamp(
      100 -
        credibility,
    );

  const distance =
    Math.abs(
      credibility - 51,
    );

  const coverage =
    totalWeight;

  let confidence =
    clamp(
      Math.round(
        48 +
          distance *
            0.9 *
            coverage +
          parts.length * 2,
      ),
    );

  if (
    evidenceDecisive
  ) {
    const averageRelevance =
      matchedClaims.reduce(
        (sum, claim) =>
          sum +
          claim.relevance,
        0,
      ) /
      matchedClaims.length;

    confidence =
      clamp(
        Math.round(
          55 +
            averageRelevance *
              0.4,
        ),
      );
  }

  if (
    downgraded
  ) {
    confidence =
      Math.min(
        confidence,
        60,
      );
  }

  return {
    prediction,

    credibility,

    riskScore:
      clamp(
        100 -
          credibility,
      ),

    confidence,

    weights,

    downgraded,

    evidenceDecisive,
  };
}

/* ------------------------------------------------------------------ */
/* EXPLANATION                                                        */
/* ------------------------------------------------------------------ */

export function buildExplanation(
  text: TextAnalysis,

  image: ImageAnalysis,

  fact: FactCheckResult,

  source: SourceCredibility,

  prediction: Verdict,

  credibility: number,
): string {
  const lines:
    string[] = [];

  const matchedEvidence =
    fact.available
      ? fact.claims.filter(
          (claim) =>
            claim.status !==
              "UNVERIFIED" &&
            claim.sourceUrl !==
              null &&
            claim.relevance >=
              50,
        )
      : [];

  if (
    matchedEvidence.length >
    0
  ) {
    lines.push(
      `The ${prediction} verdict is based on retrieved external reporting that directly ${
        matchedEvidence.some(
          (claim) =>
            claim.status ===
            "CONTRADICTED",
        )
          ? "contradicts"
          : "supports"
      } the submitted factual claim. Text credibility and grammar did not determine this verdict.`,
    );
  } else {
    lines.push(
      `No sufficiently relevant external source directly resolved the claim. The combined credibility is ${credibility}/100, so the result remains ${prediction}.`,
    );
  }

  lines.push(
    `Text quality signal (secondary only): ${text.credibilityScore}/100. This describes language patterns and is not treated as proof that a factual claim is true or false. ${text.reasoning}`,
  );

  if (
    text.sensationalismIndicators
      .length
  ) {
    lines.push(
      `Sensationalism indicators detected: ${text.sensationalismIndicators.join(", ")}.`,
    );
  }

  if (
    text.suspiciousPhrases
      .length
  ) {
    lines.push(
      `Suspicious phrases: ${text.suspiciousPhrases.slice(0, 5).join("; ")}.`,
    );
  }

  if (
    image.available
  ) {
    lines.push(
      `Image head: ${image.status}${
        image.score !== null
          ? ` (${image.score}/100)`
          : ""
      }. ${image.explanation}`,
    );
  } else {
    lines.push(
      "Image Analysis: Not Available — no image was supplied, so fusion re-weighted the remaining signals.",
    );
  }

  if (
    fact.available
  ) {
    const supported =
      fact.claims.filter(
        (c) =>
          c.status ===
          "SUPPORTED",
      ).length;

    const contradicted =
      fact.claims.filter(
        (c) =>
          c.status ===
          "CONTRADICTED",
      ).length;

    const unverified =
      fact.claims.filter(
        (c) =>
          c.status ===
          "UNVERIFIED",
      ).length;

    lines.push(
      `Fact verification over ${fact.claims.length} extracted claim(s) against retrieved sources: ${supported} supported, ${contradicted} contradicted, ${unverified} unverified.`,
    );
  } else {
    lines.push(
      fact.message ??
        "External verification unavailable.",
    );
  }

  lines.push(
    `Source credibility: ${source.score}/100${
      source.domain
        ? ` for ${source.domain}`
        : " (no domain provided)"
    }. ${source.notes.join(" ")}`,
  );

  return lines.join(
    "\n\n",
  );
}

/* ------------------------------------------------------------------ */
/* ORCHESTRATOR                                                       */
/* ------------------------------------------------------------------ */

export interface AnalyzeInput {
  headline: string;

  content?: string;

  sourceUrl?:
    string | null;

  sourceName?:
    string | null;

  author?:
    string | null;

  publicationDate?:
    string | null;

  imageDataUrl?:
    string | null;
}

export async function runPipeline(
  input: AnalyzeInput,
): Promise<AnalysisResult> {
  const headline =
    input.headline.trim();

  const content =
    (
      input.content ??
      ""
    ).trim();

  const [
    text,
    image,
    fact,
  ] =
    await Promise.all([
      analyzeText(
        headline,
        content,
      ),

      input.imageDataUrl
        ? analyzeImage(
            input.imageDataUrl,
            headline,
          )
        : Promise.resolve(
            NO_IMAGE,
          ),

      factCheck(
        headline,
        content,
      ),
    ]);

  const source =
    assessSource(input);

  const {
    prediction,
    credibility,
    riskScore,
    confidence,
    weights,
    downgraded,
  } =
    fuse(
      text,
      image,
      fact,
      source,
    );

  let explanation =
    buildExplanation(
      text,
      image,
      fact,
      source,
      prediction,
      credibility,
    );

  if (
    downgraded
  ) {
    explanation +=
      "\n\nNote: language/style signals alone looked suspicious, but no retrieved external reporting contradicted the claims. The verdict was therefore held at UNCERTAIN rather than FAKE — TruthGuard never convicts on writing quality without external evidence.";
  }

  return {
    headline,

    content,

    prediction,

    confidence,

    riskScore,

    riskLevel:
      riskLevelFor(
        riskScore,
      ),

    scores: {
      text:
        text.credibilityScore,

      image:
        image.score,

      evidence:
        fact.evidenceScore,

      source:
        source.score,
    },

    explanation,

    recommendation:
      recommendationFor(
        prediction,
      ),

    text,

    image,

    factCheck:
      fact,

    source,

    modelMode:
      text.mode ===
      "transformer"
        ? "full"
        : "lightweight",

    fusionWeights:
      weights,
  };
}