import { FollowerInstance } from '@/types/card.types';
import { BoardState, PlayerId } from '@/types/game.types';

export interface CombatResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  attackerNewHealth: number;
  defenderNewHealth: number;
  drainAmount: number;      // ドレインによる回復量
  knockbackDamage: number;  // ふっとびダメージ（ビヨンド超進化）
}

/**
 * 2体のフォロワー間の戦闘ダメージを計算
 * Shadowverseでは双方が同時にダメージを与え合う
 * ビヨンド仕様：超進化した自ターン中はダメージ無効、敵撃破時ふっとび
 */
export function calculateCombat(
  attacker: FollowerInstance,
  defender: FollowerInstance
): CombatResult {
  const attackerDamage = attacker.currentAttack;
  const defenderDamage = defender.currentAttack;

  // ビヨンド超進化：自ターン中ダメージ無効
  // attackerがsuperEvolvedThisTurnの場合、反撃ダメージを0にする
  const effectiveDefenderDamage = attacker.superEvolvedThisTurn ? 0 : defenderDamage;

  let attackerNewHealth = attacker.currentHealth - effectiveDefenderDamage;
  let defenderNewHealth = defender.currentHealth - attackerDamage;

  // 必殺能力のチェック（ダメージを与えたら相手を破壊）
  const attackerHasBane = attacker.abilities.includes('Bane');
  const defenderHasBane = defender.abilities.includes('Bane');

  if (attackerHasBane && attackerDamage > 0) {
    defenderNewHealth = 0;
  }
  // ビヨンド超進化：自ターン中は必殺による破壊も無効
  if (defenderHasBane && effectiveDefenderDamage > 0 && !attacker.superEvolvedThisTurn) {
    attackerNewHealth = 0;
  }

  // ドレイン能力のチェック（攻撃者がダメージを与えた分だけリーダーを回復）
  const attackerHasDrain = attacker.abilities.includes('Drain');
  const drainAmount = attackerHasDrain ? attackerDamage : 0;

  // ビヨンド超進化：ふっとび（敵フォロワー撃破時リーダーに1ダメージ）
  const defenderDestroyed = defenderNewHealth <= 0;
  const knockbackDamage = (attacker.superEvolvedThisTurn && defenderDestroyed) ? 1 : 0;

  return {
    attackerDamage,
    defenderDamage,
    attackerDestroyed: attackerNewHealth <= 0,
    defenderDestroyed,
    attackerNewHealth: Math.max(0, attackerNewHealth),
    defenderNewHealth: Math.max(0, defenderNewHealth),
    drainAmount,
    knockbackDamage,
  };
}

/**
 * フォロワーの有効な攻撃対象を取得
 * Ward持ちがいる場合、Ward持ちしか攻撃できない
 */
export function getValidAttackTargets(
  attackerPlayerId: PlayerId,
  board: BoardState
): string[] {
  const opponentField =
    attackerPlayerId === 'player1'
      ? board.player2Field
      : board.player1Field;

  const opponentFollowers = opponentField.followers.filter(
    (f): f is FollowerInstance => f !== null
  );

  // Ward持ちがいるかチェック
  const wardFollowers = opponentFollowers.filter((f) =>
    f.abilities.includes('Ward')
  );

  // Ward持ちがいる場合、Ward持ちのみが攻撃対象
  if (wardFollowers.length > 0) {
    return wardFollowers.map((f) => f.instanceId);
  }

  // そうでなければ全ての敵フォロワーが対象
  return opponentFollowers.map((f) => f.instanceId);
}

/**
 * フォロワーがこのターン攻撃可能かチェック
 */
export function canFollowerAttack(
  follower: FollowerInstance,
  currentTurn: number
): boolean {
  // 既にこのターン攻撃済み
  if (follower.hasAttacked) {
    return false;
  }

  // 召喚酔いチェック
  const justPlayed = follower.turnPlayed === currentTurn;

  if (justPlayed) {
    // Rush: 出したターンにフォロワーを攻撃可能
    // Storm: 出したターンに何でも攻撃可能
    return (
      follower.abilities.includes('Rush') ||
      follower.abilities.includes('Storm')
    );
  }

  return true;
}
