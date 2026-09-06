const fs = require("fs");
const path = require("path");
const { UPLOAD_ROOT, UPLOAD_DIRS } = require("../config/upload");

const DIRECTORY_BY_URL_SEGMENT = {
  profiles: UPLOAD_DIRS.profiles,
  slips: UPLOAD_DIRS.slips,
  sources: UPLOAD_DIRS.sources,
  "ai-generated": UPLOAD_DIRS.aiGenerated,
  gallery: UPLOAD_DIRS.gallery,
};

const ALLOWED_DIRECTORIES = {
  source: [UPLOAD_DIRS.sources],
  orderImage: [UPLOAD_DIRS.gallery, UPLOAD_DIRS.aiGenerated],
  slip: [UPLOAD_DIRS.slips],
  profile: [UPLOAD_DIRS.profiles],
  gallery: [UPLOAD_DIRS.gallery, UPLOAD_DIRS.aiGenerated],
};

const parseStoredUploadPath = (storedUrl) => {
  if (!storedUrl || typeof storedUrl !== "string" || storedUrl.includes("\0")) return null;

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(storedUrl, "http://internal").pathname);
  } catch {
    return null;
  }

  if (!pathname.startsWith("/uploads/") || pathname.includes("\0") || pathname.includes("\\")) {
    return null;
  }

  const segments = pathname.slice("/uploads/".length).split("/");
  if (
    segments.length < 1
    || segments.length > 2
    || segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return null;
  }

  return segments;
};

const isInsideDirectory = (filePath, directory) => {
  const resolvedDirectory = path.resolve(directory);
  const resolvedFile = path.resolve(filePath);
  return resolvedFile.startsWith(`${resolvedDirectory}${path.sep}`);
};

exports.resolveStoredMediaPath = async (storedUrl, assetContext) => {
  const allowedDirectories = ALLOWED_DIRECTORIES[assetContext];
  const segments = parseStoredUploadPath(storedUrl);
  if (!allowedDirectories || !segments) return null;

  const filename = segments.at(-1);
  if (path.basename(filename) !== filename) return null;

  let candidateDirectories = allowedDirectories;
  if (segments.length === 2) {
    const typedDirectory = DIRECTORY_BY_URL_SEGMENT[segments[0]];
    if (!typedDirectory || !allowedDirectories.includes(typedDirectory)) return null;
    candidateDirectories = [typedDirectory];
  }

  for (const directory of candidateDirectories) {
    const candidate = path.resolve(directory, filename);
    if (!isInsideDirectory(candidate, directory) || !isInsideDirectory(candidate, UPLOAD_ROOT)) continue;

    try {
      const stats = await fs.promises.stat(candidate);
      if (stats.isFile()) return candidate;
    } catch {
      // Missing/unreadable files are deliberately indistinguishable to clients.
    }
  }

  return null;
};

exports.parseStoredUploadPath = parseStoredUploadPath;
