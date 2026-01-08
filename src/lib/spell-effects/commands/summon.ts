import { SpellCommand } from './base';
import { SpellContext, SpellEffectResult, SummonEffect } from '@/types/spell.types';
import { getCardDefinition } from '@/data/sample-cards';
import { createFollowerInstance, findEmptySlot } from '@/lib/game-logic/placement';
import { FollowerCardDefinition } from '@/types/card.types';
import { MAX_FOLLOWERS_PER_FIELD } from '@/types/game.types';

/**
 * 召喚効果コマンド
 */
export class SummonCommand extends SpellCommand {
  constructor(private effect: SummonEffect) {
    super();
  }

  execute(context: SpellContext): SpellEffectResult {
    const { gameState, castingPlayer } = context;
    const ownField = this.getOwnField(context);

    const definition = getCardDefinition(this.effect.tokenId);
    if (!definition || definition.type !== 'follower') {
      return { success: false, message: 'トークン定義が見つかりません' };
    }

    const followerDef = definition as FollowerCardDefinition;
    let summonedCount = 0;

    for (let i = 0; i < this.effect.count; i++) {
      const emptySlot = findEmptySlot(ownField);
      if (emptySlot === -1) {
        break; // フィールドが満杯
      }

      const follower = createFollowerInstance(followerDef, gameState.turnNumber);
      ownField.followers[emptySlot] = follower;
      summonedCount++;
    }

    if (summonedCount === 0) {
      return { success: false, message: 'フィールドが満杯で召喚できません' };
    }

    return {
      success: true,
      message: `${followerDef.name}を${summonedCount}体召喚した`,
    };
  }

  canExecute(context: SpellContext): boolean {
    const ownField = this.getOwnField(context);
    const emptySlots = ownField.followers.filter((f) => f === null).length;
    return emptySlots > 0;
  }
}
