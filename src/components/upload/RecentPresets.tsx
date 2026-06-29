"use client";

export function RecentPresets() {
  return (
    <div className="rounded-lg border border-border bg-surface-container-low p-3">
      <p className="text-label-md font-medium text-on-surface-variant">Quick tips</p>
      <ul className="mt-2 space-y-1 text-body-sm text-on-surface-variant">
        <li>Drop PDF files or folders</li>
        <li>Uploads run in the background</li>
        <li>Open files from the Files tab</li>
      </ul>
    </div>
  );
}
