export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

export function penceToPounds(pence: number): number {
  return pence / 100;
}
