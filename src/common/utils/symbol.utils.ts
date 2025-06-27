export function normalizeSymbol(rawSymbol: string): string {
  let symbol = rawSymbol;

  // 1) Remove any ".P" suffix (perpetual futures)
  symbol = symbol.replace(/\.P$/, '');

  // 2) If symbol doesn't already have a slash, insert one before the quote asset
  if (!symbol.includes('/')) {
    const match = symbol.match(/^(.+?)(USDT|BUSD|USDC)$/);
    if (match) {
      symbol = `${match[1]}/${match[2]}`;
    }
  }

  return symbol;
}