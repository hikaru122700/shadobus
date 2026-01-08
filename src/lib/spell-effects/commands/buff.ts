import { SpellCommand } from './base';
import { SpellContext, SpellEffectResult, BuffEffect, DebuffEffect } from '@/types/spell.types';

/**
 * バフ効果コマンド
 */
export class BuffCommand extends SpellCommand {
  constructor(private effect: BuffEffect) {
    super();
  }

  execute(context: SpellContext): SpellEffectResult {
    const { targetIds } = context;

    switch (this.effect.target) {
      case 'selected': {
        const targetId = targetIds[0];
        if (!targetId) {
          return { success: false, message: 'ターゲットが選択されていません' };
        }
        const target = this.getFollowerByTargetId(context, targetId);
        if (!target) {
          return { success: false, message: 'ターゲットが見つかりません' };
        }
        target.follower.currentAttack += this.effect.attackDelta;
        target.follower.currentHealth += this.effect.healthDelta;
        target.follower.maxHealth += this.effect.healthDelta;
        return {
          success: true,
          message: `+${this.effect.attackDelta}/+${this.effect.healthDelta}のバフを付与した`,
        };
      }

      case 'all_own_followers': {
        const ownField = this.getOwnField(context);
        let buffedCount = 0;
        ownField.followers.forEach((follower) => {
          if (follower) {
            follower.currentAttack += this.effect.attackDelta;
            follower.currentHealth += this.effect.healthDelta;
            follower.maxHealth += this.effect.healthDelta;
            buffedCount++;
          }
        });
        return {
          success: true,
          message: `味方${buffedCount}体に+${this.effect.attackDelta}/+${this.effect.healthDelta}のバフを付与した`,
        };
      }

      default:
        return { success: false, message: '不明なバフターゲット' };
    }
  }

  canExecute(context: SpellContext): boolean {
    if (this.effect.target === 'selected') {
      return context.targetIds.length > 0;
    }
    return true;
  }
}

/**
 * デバフ効果コマンド
 */
export class DebuffCommand extends SpellCommand {
  constructor(private effect: DebuffEffect) {
    super();
  }

  execute(context: SpellContext): SpellEffectResult {
    const { targetIds } = context;

    switch (this.effect.target) {
      case 'selected': {
        const targetId = targetIds[0];
        if (!targetId) {
          return { success: false, message: 'ターゲットが選択されていません' };
        }
        const target = this.getFollowerByTargetId(context, targetId);
        if (!target) {
          return { success: false, message: 'ターゲットが見つかりません' };
        }
        target.follower.currentAttack = Math.max(0, target.follower.currentAttack - this.effect.attackDelta);
        target.follower.currentHealth -= this.effect.healthDelta;
        if (target.follower.currentHealth <= 0) {
          target.field.followers[target.index] = null;
        }
        return {
          success: true,
          message: `-${this.effect.attackDelta}/-${this.effect.healthDelta}のデバフを付与した`,
        };
      }

      case 'all_enemies': {
        const opponentField = this.getOpponentField(context);
        let debuffedCount = 0;
        opponentField.followers.forEach((follower, index) => {
          if (follower) {
            follower.currentAttack = Math.max(0, follower.currentAttack - this.effect.attackDelta);
            follower.currentHealth -= this.effect.healthDelta;
            if (follower.currentHealth <= 0) {
              opponentField.followers[index] = null;
            }
            debuffedCount++;
          }
        });
        return {
          success: true,
          message: `敵${debuffedCount}体に-${this.effect.attackDelta}/-${this.effect.healthDelta}のデバフを付与した`,
        };
      }

      default:
        return { success: false, message: '不明なデバフターゲット' };
    }
  }

  canExecute(context: SpellContext): boolean {
    if (this.effect.target === 'selected') {
      return context.targetIds.length > 0;
    }
    return true;
  }
}
