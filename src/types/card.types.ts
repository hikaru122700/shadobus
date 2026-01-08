import { SpellEffect, SpellTargetType } from './spell.types';

// カードタイプ
export type CardType = 'follower' | 'spell';

// フォロワーの能力
export type FollowerAbility =
  | 'Rush'   // 出したターンにフォロワーを攻撃可能
  | 'Storm'  // 出したターンに何でも攻撃可能
  | 'Ward'   // Ward持ちがいる場合、Ward以外を攻撃できない
  | 'Bane'   // ダメージを与えたフォロワーを破壊
  | 'Drain'; // 攻撃時にリーダーを回復

// フォロワーカード定義（テンプレート）
export interface FollowerCardDefinition {
  type: 'follower';
  id: string;
  name: string;
  cost: number;
  baseAttack: number;
  baseHealth: number;
  abilities: FollowerAbility[];
  description?: string;
}

// スペルカード定義
export interface SpellCardDefinition {
  type: 'spell';
  id: string;
  name: string;
  cost: number;
  targetType: SpellTargetType;
  effects: SpellEffect[];
  description?: string;
}

// カード定義のUnion型
export type CardDefinition = FollowerCardDefinition | SpellCardDefinition;

// 盤面上のフォロワーインスタンス
export interface FollowerInstance {
  instanceId: string;
  definitionId: string;
  currentAttack: number;
  currentHealth: number;
  maxHealth: number;
  abilities: FollowerAbility[];
  canAttack: boolean;
  hasAttacked: boolean;
  turnPlayed: number;
  isEvolved: boolean;           // 進化済み
  isSuperEvolved: boolean;      // 超進化済み
  superEvolvedThisTurn: boolean; // このターン超進化したか（ビヨンド：自ターン耐性用）
}

// 手札のカード
export interface HandCard {
  instanceId: string;
  definitionId: string;
  cardType: CardType;
}
