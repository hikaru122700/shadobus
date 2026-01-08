import { PlayerId, GameState } from './game.types';

// スペルのターゲットタイプ
export type SpellTargetType =
  | 'none'           // ターゲット不要
  | 'own_follower'   // 自分のフォロワー
  | 'enemy_follower' // 敵フォロワー
  | 'any_follower'   // 任意フォロワー
  | 'enemy_leader'   // 敵リーダー
  | 'all_enemies';   // 敵全体（AoE）

// スペル実行時のコンテキスト
export interface SpellContext {
  gameState: GameState;
  castingPlayer: PlayerId;
  targetIds: string[];
}

// スペル効果の実行結果
export interface SpellEffectResult {
  success: boolean;
  message?: string;
}

// ダメージ効果
export interface DamageEffect {
  type: 'damage';
  amount: number;
  target: 'selected' | 'all_enemies' | 'enemy_leader';
}

// 回復効果
export interface HealEffect {
  type: 'heal';
  amount: number;
  target: 'own_leader' | 'selected_follower' | 'all_own_followers';
}

// ドロー効果
export interface DrawEffect {
  type: 'draw';
  count: number;
}

// バフ効果
export interface BuffEffect {
  type: 'buff';
  attackDelta: number;
  healthDelta: number;
  target: 'selected' | 'all_own_followers';
}

// デバフ効果
export interface DebuffEffect {
  type: 'debuff';
  attackDelta: number;
  healthDelta: number;
  target: 'selected' | 'all_enemies';
}

// 破壊効果
export interface DestroyEffect {
  type: 'destroy';
  target: 'selected' | 'all_enemies' | 'random_enemy';
}

// 召喚効果
export interface SummonEffect {
  type: 'summon';
  tokenId: string;
  count: number;
}

// スペル効果のUnion型
export type SpellEffect =
  | DamageEffect
  | HealEffect
  | DrawEffect
  | BuffEffect
  | DebuffEffect
  | DestroyEffect
  | SummonEffect;
