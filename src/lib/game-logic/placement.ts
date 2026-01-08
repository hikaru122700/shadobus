import { v4 as uuidv4 } from 'uuid';
import {
  FollowerInstance,
  FollowerCardDefinition,
} from '@/types/card.types';
import { PlayerField, MAX_FOLLOWERS_PER_FIELD } from '@/types/game.types';

/**
 * フォロワーを配置可能かチェック
 */
export function canPlaceFollower(
  field: PlayerField,
  cost: number,
  currentPP: number
): { canPlace: boolean; reason?: string } {
  if (cost > currentPP) {
    return { canPlace: false, reason: 'PPが足りません' };
  }

  const emptySlots = field.followers.filter((f) => f === null).length;
  if (emptySlots === 0) {
    return { canPlace: false, reason: 'フィールドが満杯です' };
  }

  return { canPlace: true };
}

/**
 * フィールドの最初の空きスロットを見つける
 */
export function findEmptySlot(field: PlayerField): number {
  return field.followers.findIndex((f) => f === null);
}

/**
 * カード定義からフォロワーインスタンスを作成
 */
export function createFollowerInstance(
  definition: FollowerCardDefinition,
  turnNumber: number
): FollowerInstance {
  const hasRushOrStorm =
    definition.abilities.includes('Rush') ||
    definition.abilities.includes('Storm');

  return {
    instanceId: uuidv4(),
    definitionId: definition.id,
    currentAttack: definition.baseAttack,
    currentHealth: definition.baseHealth,
    maxHealth: definition.baseHealth,
    abilities: [...definition.abilities],
    canAttack: hasRushOrStorm,
    hasAttacked: false,
    turnPlayed: turnNumber,
  };
}

/**
 * フォロワーをフィールドに配置
 */
export function placeFollower(
  field: PlayerField,
  follower: FollowerInstance,
  slotIndex?: number
): PlayerField {
  const newFollowers = [...field.followers];
  const targetSlot = slotIndex ?? findEmptySlot(field);

  if (targetSlot === -1 || newFollowers[targetSlot] !== null) {
    throw new Error('有効なスロットがありません');
  }

  newFollowers[targetSlot] = follower;

  return { followers: newFollowers };
}
