export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatAvailableDate(iso: string | null | undefined): string {
  return formatDate(iso);
}

export function formatAvailabilityLabel(availableFrom: string | null | undefined): string {
  if (!availableFrom) return 'Available';
  const formatted = formatDate(availableFrom);
  return formatted ? `Available from ${formatted}` : 'Available';
}
