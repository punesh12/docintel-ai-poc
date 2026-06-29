"use client";

interface UploadStatsBarProps {
  stats: {
    total: number;
    uploading: number;
    queued: number;
    completed: number;
    failed: number;
  };
}

const STAT_CARDS = [
  { key: "total" as const, label: "Total", bg: "bg-[#F3F4FF]", text: "text-[#3525CD]" },
  { key: "uploading" as const, label: "Uploading", bg: "bg-blue-50", text: "text-blue-600" },
  { key: "queued" as const, label: "Queued", bg: "bg-amber-50", text: "text-amber-600" },
  { key: "completed" as const, label: "Completed", bg: "bg-emerald-50", text: "text-emerald-600" },
  { key: "failed" as const, label: "Failed", bg: "bg-red-50", text: "text-red-600" },
];

export function UploadStatsBar({ stats }: UploadStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:grid-cols-5">
      {STAT_CARDS.map(({ key, label, bg, text }) => (
        <div key={key} className={`rounded-lg px-4 py-3 ${bg}`}>
          <p className={`text-headline-md font-semibold ${text}`}>{stats[key]}</p>
          <p className="text-body-sm text-on-surface-variant">{label}</p>
        </div>
      ))}
    </div>
  );
}
