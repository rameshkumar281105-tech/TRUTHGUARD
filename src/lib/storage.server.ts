import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export interface ParsedImage {
  bytes: Uint8Array;
  mime: string;
  ext: string;
  dataUrl: string;
}

/** Validates a client-supplied data URL: type allow-list + hard size cap. */
export function parseImageDataUrl(dataUrl: string): ParsedImage {
  const m = /^data:([a-zA-Z0-9/+.-]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl.trim());
  if (!m) throw new Error("Invalid image payload.");
  const mime = (m[1] ?? "").toLowerCase();
  const ext = ALLOWED.get(mime);
  if (!ext) throw new Error("Unsupported image type. Use JPG, PNG or WEBP.");
  const b64 = (m[2] ?? "").replace(/\s/g, "");
  const binary = atob(b64);
  if (binary.length > MAX_IMAGE_BYTES) throw new Error("Image exceeds the 10 MB limit.");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, mime, ext, dataUrl: `data:${mime};base64,${b64}` };
}

/** Stores the image under a server-generated (never client-supplied) filename. */
export async function storeImage(img: ParsedImage): Promise<string | null> {
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${img.ext}`;
  const { error } = await supabaseAdmin.storage
    .from("news-images")
    .upload(path, img.bytes, { contentType: img.mime, upsert: false });
  if (error) {
    console.error("[storage] upload failed", error.message);
    return null;
  }
  return path;
}

export async function signedImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage
    .from("news-images")
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}
