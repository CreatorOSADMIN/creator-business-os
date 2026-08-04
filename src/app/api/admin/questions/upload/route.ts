import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { verifySameOrigin } from "@/lib/verify-origin";
import { saveUploadedMedia, MediaUploadError } from "@/lib/media-upload";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { response } = await requireAdmin();
  if (response) return response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const { url, kind } = await saveUploadedMedia(file);
    return NextResponse.json({ url, kind }, { status: 201 });
  } catch (err) {
    if (err instanceof MediaUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logger.error("questions: media upload failed", { scope: "admin-questions-upload", err });
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
