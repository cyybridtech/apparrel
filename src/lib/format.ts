/**
 * Format a price in pesewas (1/100 of a Cedi) to Ghana Cedi display string.
 * e.g. 55000 → "GH₵ 550"
 */
export function eur(pesewas: number): string {
  const hasFraction = pesewas % 100 !== 0;
  const amount = pesewas / 100;
  return `GH₵ ${new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount)}`;
}

export function formatDate(d: string | Date): string {
  return new Intl.DateTimeFormat("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}
