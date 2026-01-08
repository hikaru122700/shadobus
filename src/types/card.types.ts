// フォロワーの能力
export type FollowerAbility =
  | 'Rush'   // 出したターンにフォロワーを攻撃可能
  | 'Storm'  // 出したターンに何でも攻撃可能
  | 'Ward'   // Ward持ちがいる場合、Ward以外を攻撃できない
  | 'Bane'   // ダメージを与えたフォロワーを破壊
  | 'Drain'; // 攻撃時にリーダーを回復

// カード定義（テンプレート）
export interface FollowerCardDefinition {
  id: string;
  name: string;
  cost: number;
  baseAttack: number;
  baseHealth: number;
  abilities: FollowerAbility[];
  description?: string;
}

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
}

// 手札のカード
export interface HandCard {
  instanceId: string;
  definitionId: string;
}
