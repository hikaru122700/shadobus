import { SpellCommand } from './base';
import { SpellContext, SpellEffectResult, DestroyEffect } from '@/types/spell.types';

/**
 * 破壊効果コマンド
 */
export class DestroyCommand extends SpellCommand {
  constructor(private effect: DestroyEffect) {
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
        target.field.followers[target.index] = null;
        return { success: true, message: 'フォロワーを破壊した' };
      }

      case 'all_enemies': {
        const opponentField = this.getOpponentField(context);
        let destroyedCount = 0;
        opponentField.followers.forEach((follower, index) => {
          if (follower) {
            opponentField.followers[index] = null;
            destroyedCount++;
          }
        });
        return { success: true, message: `敵${destroyedCount}体を破壊した` };
      }

      case 'random_enemy': {
        const opponentField = this.getOpponentField(context);
        const validTargets = opponentField.followers
          .map((f, i) => (f ? i : -1))
          .filter((i) => i !== -1);

        if (validTargets.length === 0) {
          return { success: false, message: '破壊できるフォロワーがいません' };
        }

        const randomIndex = validTargets[Math.floor(Math.random() * validTargets.length)];
        opponentField.followers[randomIndex] = null;
        return { success: true, message: 'ランダムな敵1体を破壊した' };
      }

      default:
        return { success: false, message: '不明な破壊ターゲット' };
    }
  }

  canExecute(context: SpellContext): boolean {
    if (this.effect.target === 'selected') {
      return context.targetIds.length > 0;
    }
    if (this.effect.target === 'random_enemy') {
      const opponentField = this.getOpponentField(context);
      return opponentField.followers.some((f) => f !== null);
    }
    return true;
  }
}
