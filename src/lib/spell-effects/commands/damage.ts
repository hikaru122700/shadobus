import { SpellCommand } from './base';
import { SpellContext, SpellEffectResult, DamageEffect } from '@/types/spell.types';

/**
 * ダメージ効果コマンド
 */
export class DamageCommand extends SpellCommand {
  constructor(private effect: DamageEffect) {
    super();
  }

  execute(context: SpellContext): SpellEffectResult {
    const { gameState, targetIds } = context;

    switch (this.effect.target) {
      case 'selected': {
        // 選択したフォロワーにダメージ
        const targetId = targetIds[0];
        if (!targetId) {
          return { success: false, message: 'ターゲットが選択されていません' };
        }
        const target = this.getFollowerByTargetId(context, targetId);
        if (!target) {
          return { success: false, message: 'ターゲットが見つかりません' };
        }
        target.follower.currentHealth -= this.effect.amount;
        if (target.follower.currentHealth <= 0) {
          target.field.followers[target.index] = null;
        }
        return { success: true, message: `${this.effect.amount}ダメージを与えた` };
      }

      case 'all_enemies': {
        // 敵全体にダメージ
        const opponentField = this.getOpponentField(context);
        opponentField.followers.forEach((follower, index) => {
          if (follower) {
            follower.currentHealth -= this.effect.amount;
            if (follower.currentHealth <= 0) {
              opponentField.followers[index] = null;
            }
          }
        });
        return { success: true, message: `敵全体に${this.effect.amount}ダメージを与えた` };
      }

      case 'enemy_leader': {
        // 敵リーダーにダメージ
        const opponentId = this.getOpponentId(context);
        gameState.players[opponentId].health -= this.effect.amount;
        if (gameState.players[opponentId].health <= 0) {
          gameState.phase = 'ended';
        }
        return { success: true, message: `敵リーダーに${this.effect.amount}ダメージを与えた` };
      }

      default:
        return { success: false, message: '不明なダメージターゲット' };
    }
  }

  canExecute(context: SpellContext): boolean {
    if (this.effect.target === 'selected') {
      return context.targetIds.length > 0;
    }
    return true;
  }
}
