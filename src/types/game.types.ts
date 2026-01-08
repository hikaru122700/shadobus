import { FollowerInstance, HandCard, SpellCardDefinition } from './card.types';

// プレイヤー識別子
export type PlayerId = 'player1' | 'player2';

// ゲームフェーズ
export type GamePhase = 'waiting' | 'playing' | 'ended';

// ターンフェーズ
export type TurnPhase = 'start' | 'main' | 'end';

// 選択状態
export interface SelectionState {
  selectedAttacker: string | null;
  validTargets: string[];
  mode: 'none' | 'selectAttacker' | 'selectTarget' | 'spell_target';
  pendingSpell: SpellCardDefinition | null;
  pendingSpellCardIndex: number;
}

// プレイヤーフィールド
export interface PlayerField {
  followers: (FollowerInstance | null)[];
}

// 盤面状態
export interface BoardState {
  player1Field: PlayerField;
  player2Field: PlayerField;
}

// プレイヤー状態
export interface PlayerState {
  id: PlayerId;
  deck: string[]; // カード定義IDの配列
  hand: HandCard[];
  currentPP: number;
  maxPP: number;
  health: number;
  evolutionPoints: number;          // 残り進化権 (先攻2, 後攻2)
  superEvolutionPoints: number;     // 残り超進化権 (2)
  isFirstPlayer: boolean;           // 先攻かどうか
  hasEvolvedThisTurn: boolean;      // このターン進化したか
  hasSuperEvolvedThisTurn: boolean; // このターン超進化したか
}

// ゲーム状態
export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentTurn: PlayerId;
  turnNumber: number;
  board: BoardState;
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  selection: SelectionState;
}

// 定数
export const MAX_FOLLOWERS_PER_FIELD = 5;
export const MAX_HAND_SIZE = 9;
export const STARTING_HEALTH = 20;
export const MAX_PP = 10;
