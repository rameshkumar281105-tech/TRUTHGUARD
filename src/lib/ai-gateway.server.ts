import { createGroq } from "@ai-sdk/groq";

export function createGroqProvider(apiKey?: string) {
  const key =
    apiKey ??
    process.env["GROQ_API_KEY"];

  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not configured.",
    );
  }

  return createGroq({
    apiKey: key,
  });
}

/** Groq model used by TruthGuard AI. */
export const TEXT_MODEL = "openai/gpt-oss-120b";

export const VISION_MODEL = "qwen/qwen3.8-27b";