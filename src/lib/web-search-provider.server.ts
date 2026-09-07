export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
  content: string;
  sourceName?: string | null;
  publishedAt?: string | null;
}

/* ================================================================
   TEXT / HTML HELPERS
================================================================ */

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCharCode(Number(n)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    );
}

function stripHtml(value: string): string {
  return decodeEntities(
    value
      .replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        " ",
      )
      .replace(
        /<style\b[^>]*>[\s\S]*?<\/style>/gi,
        " ",
      )
      .replace(
        /<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,
        " ",
      )
      .replace(
        /<svg\b[^>]*>[\s\S]*?<\/svg>/gi,
        " ",
      )
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(raw: string): string | null {
  let value = decodeEntities(raw).trim();

  if (!value) {
    return null;
  }

  if (value.startsWith("//")) {
    value = `https:${value}`;
  }

  try {
    const parsed = new URL(value);

    /*
     * DuckDuckGo redirect.
     */
    const uddg = parsed.searchParams.get("uddg");

    if (uddg) {
      value = decodeURIComponent(uddg);
    }

    /*
     * Some Google URLs expose an original URL through ?url=...
     */
    const originalUrl =
      parsed.searchParams.get("url");

    if (
      originalUrl &&
      parsed.hostname === "news.google.com"
    ) {
      value =
        decodeURIComponent(originalUrl);
    }
  } catch {
    return null;
  }

  if (!/^https?:\/\//i.test(value)) {
    return null;
  }

  return value;
}

function extractTag(
  xml: string,
  tag: string,
): string {
  const match = xml.match(
    new RegExp(
      `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
      "i",
    ),
  );

  return decodeEntities(
    (match?.[1] ?? "")
      .replace(
        /^<!\[CDATA\[|\]\]>$/g,
        "",
      )
      .trim(),
  );
}

function getDomain(
  url: string,
): string | null {
  try {
    return new URL(url)
      .hostname
      .replace(/^www\./i, "")
      .toLowerCase();
  } catch {
    return null;
  }
}

/* ================================================================
   ARTICLE EXTRACTION
================================================================ */

function extractArticleContent(
  html: string,
): string {
  let cleaned = html;

  cleaned = cleaned
    .replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      " ",
    )
    .replace(
      /<style\b[^>]*>[\s\S]*?<\/style>/gi,
      " ",
    )
    .replace(
      /<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,
      " ",
    )
    .replace(
      /<svg\b[^>]*>[\s\S]*?<\/svg>/gi,
      " ",
    )
    .replace(
      /<nav\b[^>]*>[\s\S]*?<\/nav>/gi,
      " ",
    )
    .replace(
      /<footer\b[^>]*>[\s\S]*?<\/footer>/gi,
      " ",
    )
    .replace(
      /<header\b[^>]*>[\s\S]*?<\/header>/gi,
      " ",
    )
    .replace(
      /<aside\b[^>]*>[\s\S]*?<\/aside>/gi,
      " ",
    )
    .replace(
      /<form\b[^>]*>[\s\S]*?<\/form>/gi,
      " ",
    );

  const articleMatches = [
    ...cleaned.matchAll(
      /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
    ),
  ];

  const mainMatches = [
    ...cleaned.matchAll(
      /<main\b[^>]*>([\s\S]*?)<\/main>/gi,
    ),
  ];

  let candidate = "";

  if (articleMatches.length > 0) {
    candidate = articleMatches
      .map((match) => match[1] ?? "")
      .join(" ");
  } else if (mainMatches.length > 0) {
    candidate = mainMatches
      .map((match) => match[1] ?? "")
      .join(" ");
  } else {
    candidate = cleaned;
  }

  let text = stripHtml(candidate);

  text = text
    .replace(/\s+/g, " ")
    .trim();

  /*
   * Keep enough article text for deterministic evidence matching.
   */
  if (text.length > 16000) {
    text = text.slice(0, 16000);
  }

  return text;
}

/* ================================================================
   FETCH PUBLISHER ARTICLE
================================================================ */

async function fetchArticleContent(
  url: string,
): Promise<string> {
  if (
    !url ||
    url.includes("news.google.com")
  ) {
    return "";
  }

  try {
    const response = await fetch(url, {
      redirect: "follow",

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

        "Accept-Language":
          "en-IN,en;q=0.9",
      },

      signal:
        AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(
        `[article] HTTP ${response.status}: ${url}`,
      );

      return "";
    }

    const contentType =
      response.headers.get(
        "content-type",
      ) ?? "";

    if (
      !contentType.includes("text/html") &&
      !contentType.includes(
        "application/xhtml",
      )
    ) {
      return "";
    }

    const html =
      await response.text();

    const content =
      extractArticleContent(html);

    if (content.length < 120) {
      return "";
    }

    console.log(
      `[article] extracted ${content.length} chars from ${url}`,
    );

    return content;
  } catch (error) {
    console.warn(
      `[article] failed for ${url}`,
      error,
    );

    return "";
  }
}

/* ================================================================
   DUCKDUCKGO DIRECT RESULT RESOLUTION
================================================================ */

/**
 * Google News frequently gives:
 *
 * news.google.com/rss/articles/...
 *
 * instead of the publisher URL.
 *
 * Google can return:
 *
 * 302 -> another news.google.com URL
 *
 * Therefore we do NOT depend on that redirect.
 *
 * Instead we search DuckDuckGo using the article title
 * and publisher domain and extract a direct publisher URL.
 */
async function resolvePublisherUrl(
  title: string,
  sourceName: string,
  sourceUrl: string,
): Promise<string | null> {
  const sourceDomain =
    getDomain(sourceUrl);

  const queries = [
    `"${title}" ${sourceName}`,
    sourceDomain
      ? `"${title}" site:${sourceDomain}`
      : `"${title}" ${sourceName}`,
  ];

  for (
    const query of queries
  ) {
    try {
      const endpoint =
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(
          query,
        )}`;

      const response =
        await fetch(endpoint, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",

            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

            "Accept-Language":
              "en-IN,en;q=0.9",
          },

          signal:
            AbortSignal.timeout(7000),
        });

      if (!response.ok) {
        continue;
      }

      const html =
        await response.text();

      const links = [
        ...html.matchAll(
          /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
        ),
      ];

      for (const match of links) {
        const candidate =
          normalizeUrl(
            match[1] ?? "",
          );

        if (!candidate) {
          continue;
        }

        const domain =
          getDomain(candidate);

        if (!domain) {
          continue;
        }

        /*
         * Never return Google News itself.
         */
        if (
          domain ===
          "news.google.com"
        ) {
          continue;
        }

        /*
         * If the RSS source domain is known,
         * strongly prefer that publisher.
         */
        if (
          sourceDomain &&
          (
            domain === sourceDomain ||
            domain.endsWith(
              `.${sourceDomain}`,
            )
          )
        ) {
          console.log(
            `[publisher] resolved "${title}" -> ${candidate}`,
          );

          return candidate;
        }

        /*
         * Otherwise accept a normal HTTPS publisher.
         */
        if (
          /^https:\/\//i.test(
            candidate,
          )
        ) {
          console.log(
            `[publisher] fallback resolved "${title}" -> ${candidate}`,
          );

          return candidate;
        }
      }
    } catch (error) {
      console.warn(
        `[publisher] resolution failed for "${title}"`,
        error,
      );
    }
  }

  return null;
}

/* ================================================================
   GOOGLE NEWS RSS
================================================================ */

export async function googleNewsSearch(
  query: string,
  limit = 5,
): Promise<SearchHit[]> {
  const endpoint =
    `https://news.google.com/rss/search?q=${encodeURIComponent(
      query,
    )}` +
    "&hl=en-IN&gl=IN&ceid=IN:en";

  try {
    const response =
      await fetch(endpoint, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 TruthGuardAI/1.0",

          Accept:
            "application/rss+xml, application/xml, text/xml, */*",

          "Accept-Language":
            "en-IN,en;q=0.9",
        },

        signal:
          AbortSignal.timeout(10000),
      });

    if (!response.ok) {
      console.warn(
        `[google-news] HTTP ${response.status} for "${query}"`,
      );

      return [];
    }

    const xml =
      await response.text();

    const items =
      xml.match(
        /<item\b[\s\S]*?<\/item>/gi,
      ) ?? [];

    const results: SearchHit[] = [];

    for (
      const item of items.slice(
        0,
        Math.max(limit, 1),
      )
    ) {
      const title =
        stripHtml(
          extractTag(
            item,
            "title",
          ),
        );

      const rawLink =
        extractTag(
          item,
          "link",
        );

      const description =
        stripHtml(
          extractTag(
            item,
            "description",
          ),
        );

      const sourceName =
        stripHtml(
          extractTag(
            item,
            "source",
          ),
        );

      const sourceUrl =
        normalizeUrl(
          (() => {
            const match =
              item.match(
                /<source\b[^>]*url="([^"]+)"/i,
              );

            return match?.[1] ?? "";
          })(),
        );

      const publishedAt =
        extractTag(
          item,
          "pubDate",
        );

      if (
        !title
      ) {
        continue;
      }

      /*
       * IMPORTANT:
       *
       * Do not assume the RSS link is the publisher URL.
       */
      let articleUrl =
        normalizeUrl(
          rawLink,
        );

      /*
       * If it is Google News, attempt direct publisher resolution.
       */
      
      /*
       * If publisher resolution failed,
       * keep the Google News URL only as a last-resort
       * evidence URL. The RSS title/description is still usable.
       */
      if (!articleUrl) {
        continue;
      }

      let content = description;

      results.push({
        title,
      
        url: articleUrl,
      
        snippet:
          [
            description,
            sourceName,
            publishedAt,
          ]
            .filter(Boolean)
            .join(" · "),
      
        content,
      
        sourceName:
          sourceName ||
          null,
      
        publishedAt:
          publishedAt ||
          null,
      });
    }

    console.log(
      `[google-news] ${results.length} results for "${query}"`,
    );

    return results;
  } catch (error) {
    console.error(
      `[google-news] failed for "${query}"`,
      error,
    );

    return [];
  }
}

/* ================================================================
   DUCKDUCKGO SEARCH
================================================================ */

export async function duckDuckGoSearch(
  query: string,
  limit = 5,
): Promise<SearchHit[]> {
  const endpoint =
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(
      query,
    )}`;

  try {
    const response =
      await fetch(endpoint, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

          "Accept-Language":
            "en-IN,en;q=0.9",
        },

        signal:
          AbortSignal.timeout(10000),
      });

    if (!response.ok) {
      return [];
    }

    const html =
      await response.text();

    const links = [
      ...html.matchAll(
        /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      ),
    ];

    const results: SearchHit[] = [];

    for (
      const match of links
    ) {
      if (
        results.length >= limit
      ) {
        break;
      }

      const url =
        normalizeUrl(
          match[1] ?? "",
        );

      const title =
        stripHtml(
          match[2] ?? "",
        );

      if (
        !url ||
        !title ||
        url.includes(
          "duckduckgo.com",
        )
      ) {
        continue;
      }

      /*
       * Find the nearby result snippet.
       */
      const anchorIndex =
        html.indexOf(
          match[0],
        );

      const nearby =
        html.slice(
          anchorIndex,
          anchorIndex + 3000,
        );

      const snippetMatch =
        nearby.match(
          /class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div)>/i,
        );

      const snippet =
        stripHtml(
          snippetMatch?.[1] ?? "",
        );

      const content =
        await fetchArticleContent(
          url,
        );

      results.push({
        title,

        url,

        snippet,

        content,

        sourceName:
          getDomain(url),

        publishedAt:
          null,
      });
    }

    console.log(
      `[duckduckgo] ${results.length} results for "${query}"`,
    );

    return results;
  } catch (error) {
    console.error(
      `[duckduckgo] failed for "${query}"`,
      error,
    );

    return [];
  }
}

/* ================================================================
   PUBLIC SEARCH
================================================================ */

export async function webSearch(
  query: string,
  limit = 5,
): Promise<SearchHit[]> {
  const cleaned =
    query.trim();

  if (!cleaned) {
    return [];
  }

  console.log(
    `[web-search] Searching: "${cleaned}"`,
  );

  /*
   * Google News is preferred for news verification.
   */
  const googleResults =
    await googleNewsSearch(
      cleaned,
      limit,
    );
    console.log(
      "[DEBUG SEARCH RESULTS]",
      googleResults.map((hit) => ({
        title: hit.title,
        snippet: hit.snippet,
        url: hit.url,
      })),
    );

  if (
    googleResults.length > 0
  ) {
    return googleResults;
  }

  /*
   * DuckDuckGo fallback.
   */
  const ddgResults =
    await duckDuckGoSearch(
      cleaned,
      limit,
    );

  if (
    ddgResults.length > 0
  ) {
    return ddgResults;
  }

  console.warn(
    `[web-search] No results found for "${cleaned}"`,
  );

  return [];
}