import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const target = join(root, "public", "pdfjs");
const marker = join(target, "web", "viewer.html");
const version = "5.4.296";
const zipUrl = `https://github.com/mozilla/pdf.js/releases/download/v${version}/pdfjs-${version}-dist.zip`;
const zipPath = join(root, ".cache", `pdfjs-${version}-dist.zip`);

if (existsSync(marker)) {
  console.log("PDF.js viewer already installed at public/pdfjs");
  process.exit(0);
}

mkdirSync(join(root, ".cache"), { recursive: true });
mkdirSync(target, { recursive: true });

console.log(`Downloading PDF.js viewer v${version}...`);
const response = await fetch(zipUrl);
if (!response.ok) {
  throw new Error(`Failed to download PDF.js viewer: ${response.status}`);
}

await pipeline(response.body, createWriteStream(zipPath));
console.log("Extracting to public/pdfjs...");
execSync(`unzip -qo "${zipPath}" -d "${target}"`, { stdio: "inherit" });
console.log("PDF.js viewer ready at public/pdfjs/web/viewer.html");
