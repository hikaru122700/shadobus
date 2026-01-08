import { SpellCommand } from './base';
import { SpellContext, SpellEffectResult, HealEffect } from '@/types/spell.types';
import { STARTING_HEALTH } from '@/types/game.types';

/**
 * 回復効果コマンド
 */
export class HealCommand extends SpellCommand {
  constructor(private effect: HealEffect) {
    super();
  }

  execute(context: SpellContext): SpellEffectResult {
    const { gameState, castingPlayer, targetIds } = context;

    switch (this.effect.target) {
      case 'own_leader': {
        // 自分のリーダーを回復
        const player = gameState.players[castingPlayer];
        const oldHealth = player.health;
        player.health = Math.min(STARTING_HEALTH, player.health + this.effect.amount);
        const healed = player.health - oldHealth;
        return { success: true, message: `リーダーを${healed}回復した` };
      }

      case 'selected_follower': {
        // 選択したフォロワーを回復
        const targetId = targetIds[0];
        if (!targetId) {
          return { success: false, message: 'ターゲットが選択されていません' };
        }
        const target = this.getFollowerByTargetId(context, targetId);
        if (!target) {
          return { success: false, message: 'ターゲットが見つかりません' };
        }
        const oldHealth = target.follower.currentHealth;
        target.follower.currentHealth = Math.min(
          target.follower.maxHealth,
          target.follower.currentHealth + this.effect.amount
        );
        const healed = target.follower.currentHealth - oldHealth;
        return { success: true, message: `フォロワーを${healed}回復した` };
      }

      case 'all_own_followers': {
        // 自分のフォロワー全体を回復
        const ownField = this.getOwnField(context);
        ownField.followers.forEach((follower) => {
          if (follower) {
            follower.currentHealth = Math.min(
              follower.maxHealth,
              follower.currentHealth + this.effect.amount
            );
          }
        });
        return { success: true, message: `味方全体を${this.effect.amount}回復した` };
      }

      default:
        return { success: false, message: '不明な回復ターゲット' };
    }
  }

  canExecute(context: SpellContext): boolean {
    if (this.effect.target === 'selected_follower') {
      return context.targetIds.length > 0;
    }
    return true;
  }
}
