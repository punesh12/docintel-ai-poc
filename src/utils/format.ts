const BYTE_UNITS = ["B", "KB", "MB", "GB"] as const;

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1
  );
  const value = bytes / Math.pow(1024, unitIndex);
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${BYTE_UNITS[unitIndex]}`;
}

export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

export function truncateFilename(name: string, maxLength = 32): string {
  if (name.length <= maxLength) return name;
  const ext = name.lastIndexOf(".") > 0 ? name.slice(name.lastIndexOf(".")) : "";
  const base = name.slice(0, name.length - ext.length);
  const available = maxLength - ext.length - 3;
  return `${base.slice(0, available)}...${ext}`;
}
