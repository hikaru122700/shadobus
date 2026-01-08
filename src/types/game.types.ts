import { FollowerInstance, HandCard } from './card.types';

// プレイヤー識別子
export type PlayerId = 'player1' | 'player2';

// ゲームフェーズ
export type GamePhase = 'waiting' | 'playing' | 'ended';

// ターンフェーズ
export type TurnPhase = 'start' | 'main' | 'end';

// 攻撃選択状態
export interface SelectionState {
  selectedAttacker: string | null;
  validTargets: string[];
  mode: 'none' | 'selectAttacker' | 'selectTarget';
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
