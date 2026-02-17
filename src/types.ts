export interface GameState {
  bakaze: string;
  dora_marker: string;
  honba: number;
  kyoku: number;
  oya: number;
  tehais: string[][];
  type: string;
  scores: number[];
  discards: string[][];
}

export type Event = 
  | { type: 'start_game'; aka_flag: boolean; kyoku_first: number }
  | { type: 'end_game'; scores: number[] }
  | { type: 'start_kyoku'; bakaze: string; kyoku: number; honba: number; oya: number; tehais: string[][]; scores: number[], dora_marker: string }
  | { type: 'end_kyoku'}
  | { type: 'pon'; actor: number; consumed: string[]; pai: string; target: number }
  | { type: 'chi'; actor: number; consumed: string[]; pai: string; target: number }
  | { type: 'tsumo'; actor: number; pai: string }
  | { type: 'dahai'; actor: number; pai: string; tsumogiri: boolean }
  | { type: 'reach'; actor: number }
  | { type: 'reach_accepted'; actor: number }
  | { type: 'hora'; actor: number; target: number; fan: number; fu: number; hora_tehais: string[]; pai: string; scores: number[] };