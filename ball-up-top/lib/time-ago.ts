// Short relative-time label matching the app's terse mock-review style ("19d", "4h").
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.floor(days)}d`;
  const months = days / 30;
  if (months < 12) return `${Math.floor(months)}mo`;
  return `${Math.floor(months / 12)}y`;
}
