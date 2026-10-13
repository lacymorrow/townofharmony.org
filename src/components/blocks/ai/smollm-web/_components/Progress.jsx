// @ts-nocheck

function formatBytes(size) {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return +(size / 1024 ** i).toFixed(2) * 1 + ["B", "kB", "MB", "GB", "TB"][i];
}

export default function Progress({ text, percentage, total }) {
  percentage ??= 0;
  return (
    <div className="mb-0.5 w-full overflow-hidden rounded-lg bg-gray-100 text-left dark:bg-gray-700">
      <div
        className="whitespace-nowrap bg-blue-400 px-1 text-sm"
        style={{ width: `${percentage}%` }}
      >
        {text} ({percentage.toFixed(2)}%{Number.isNaN(total) ? "" : ` of ${formatBytes(total)}`})
      </div>
    </div>
  );
}
