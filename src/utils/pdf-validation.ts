const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const PDF_MIME_TYPES = new Set(["application/pdf"]);
const PDF_EXTENSION = ".pdf";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePdfFile(file: File): ValidationResult {
  const isPdfMime = PDF_MIME_TYPES.has(file.type);
  const isPdfExtension = file.name.toLowerCase().endsWith(PDF_EXTENSION);

  if (!isPdfMime && !isPdfExtension) {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File exceeds 100 MB limit" };
  }

  return { valid: true };
}

export function validatePdfFiles(files: File[]): {
  valid: File[];
  invalid: Array<{ file: File; error: string }>;
} {
  const valid: File[] = [];
  const invalid: Array<{ file: File; error: string }> = [];

  for (const file of files) {
    const result = validatePdfFile(file);
    if (result.valid) {
      valid.push(file);
    } else {
      invalid.push({ file, error: result.error ?? "Invalid file" });
    }
  }

  return { valid, invalid };
}
