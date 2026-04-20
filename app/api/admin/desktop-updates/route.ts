import { NextResponse } from "next/server";
import { createAuditLog, requireAdminRole } from "@/lib/admin";
import {
  buildDesktopUpdateDownloadUrl,
  clearActiveDesktopUpdate,
  listDesktopUpdateFiles,
  publishDesktopUpdate,
  readDesktopUpdateDistributionConfig,
  readDesktopUpdateManifest,
  writeDesktopUpdateDistributionConfig,
} from "@/lib/update-feed";

export async function GET(request: Request) {
  const admin = await requireAdminRole(["SUPER_ADMIN"]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const [manifest, files] = await Promise.all([
    readDesktopUpdateManifest(),
    listDesktopUpdateFiles(),
  ]);
  const config = await readDesktopUpdateDistributionConfig();

  return NextResponse.json({
    config,
    active: manifest
      ? {
          ...manifest,
          downloadUrl:
            config.deliveryMode === "oss" && config.ossBaseUrl
              ? new URL(
                  `./${manifest.fileName}`,
                  config.ossBaseUrl.endsWith("/") ? config.ossBaseUrl : `${config.ossBaseUrl}/`,
                ).toString()
              : buildDesktopUpdateDownloadUrl(request, manifest.fileName),
        }
      : null,
    files,
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminRole(["SUPER_ADMIN"]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const formData = await request.formData();
  const version = String(formData.get("version") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const patch = formData.get("patch");

  if (!version) {
    return NextResponse.json({ error: "Version is required" }, { status: 400 });
  }

  if (!(patch instanceof File)) {
    return NextResponse.json({ error: "Patch file is required" }, { status: 400 });
  }

  if (!patch.name.toLowerCase().endsWith(".asar")) {
    return NextResponse.json({ error: "Patch file must be an .asar archive" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await patch.arrayBuffer());
  const manifest = await publishDesktopUpdate({
    version,
    notes,
    uploadedFileName: patch.name,
    fileBuffer,
  });

  await createAuditLog({
    userId: admin.user.id,
    action: "desktop_update.published",
    targetType: "DesktopUpdate",
    targetId: manifest.fileName,
    metadataJson: {
      version: manifest.version,
      fileName: manifest.fileName,
      sha256: manifest.sha256,
    },
  });

  return NextResponse.json({
    success: true,
    active: {
      ...manifest,
      downloadUrl: buildDesktopUpdateDownloadUrl(request, manifest.fileName),
    },
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminRole(["SUPER_ADMIN"]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json()) as {
    deliveryMode?: "local" | "oss";
    ossBaseUrl?: string;
  };

  const config = await writeDesktopUpdateDistributionConfig({
    deliveryMode: body.deliveryMode === "oss" ? "oss" : "local",
    ossBaseUrl: body.ossBaseUrl?.trim() || "",
  });

  await createAuditLog({
    userId: admin.user.id,
    action: "desktop_update.config_updated",
    targetType: "DesktopUpdateConfig",
    targetId: "desktop/windows-x64",
    metadataJson: {
      deliveryMode: config.deliveryMode,
      ossBaseUrl: config.ossBaseUrl,
    },
  });

  return NextResponse.json({ success: true, config });
}

export async function DELETE() {
  const admin = await requireAdminRole(["SUPER_ADMIN"]);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  await clearActiveDesktopUpdate();

  await createAuditLog({
    userId: admin.user.id,
    action: "desktop_update.cleared",
    targetType: "DesktopUpdate",
    targetId: null,
    metadataJson: undefined,
  });

  return NextResponse.json({ success: true });
}
