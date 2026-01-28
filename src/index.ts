import SfSymbols from "./sf-symbols-chars.json" with { type: 'json' }

export function hasSFSymbols(text: string) {
  for (const ch of text) {
    if (ch in SfSymbols) {
      return true;
    }
  }
  return false;
}

export function getUsedSFSymbols(text: string): {
  hasSFSymbols: boolean;
  symbols: { [key: string]: string };
} {
  const symbols: { [key: string]: string } = {};
  for (const ch of text) {
    if (ch in SfSymbols) {
      let key = (SfSymbols as any)[ch];
      symbols[key] = (SfSymbols as any)[ch];
    }
  }
  return {
    hasSFSymbols: Object.keys(symbols).length > 0,
    symbols,
  };
}
