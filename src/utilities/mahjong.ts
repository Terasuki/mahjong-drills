export const TILE_ORDER: Record<string, number> = {
  "1m": 1, "2m": 2, "3m": 3, "4m": 4, "5m": 5, "5mr": 5.1, "6m": 6, "7m": 7, "8m": 8, "9m": 9,
  "1p": 11, "2p": 12, "3p": 13, "4p": 14, "5p": 15, "5pr": 15.1, "6p": 16, "7p": 17, "8p": 18, "9p": 19,
  "1s": 21, "2s": 22, "3s": 23, "4s": 24, "5s": 25, "5sr": 25.1, "6s": 26, "7s": 27, "8s": 28, "9s": 29,
  "E": 31, "S": 32, "W": 33, "N": 34,
  "P": 35, "F": 36, "C": 37 
};

export const sortTiles = (tiles: string[]): string[] => {
  return [...tiles].sort((a, b) => (TILE_ORDER[a] || 99) - (TILE_ORDER[b] || 99));
};

export const getWind = (playerIdx: number, oya: number) => {
  const winds = ["E", "S", "W", "N"];
  const relativePos = (playerIdx - oya + 4) % 4;
  return winds[relativePos];
};