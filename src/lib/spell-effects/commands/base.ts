import { SpellContext, SpellEffectResult } from '@/types/spell.types';
import { FollowerInstance } from '@/types/card.types';
import { PlayerField, PlayerId } from '@/types/game.types';

/**
 * スペルコマンドの基底クラス
 * Command Pattern を使用してスペル効果を実装
 */
export abstract class SpellCommand {
  /**
   * コマンドを実行
   */
  abstract execute(context: SpellContext): SpellEffectResult;

  /**
   * コマンドが実行可能かチェック
   */
  abstract canExecute(context: SpellContext): boolean;

  /**
   * ターゲットIDからフォロワーを取得
   */
  protected getFollowerByTargetId(
    context: SpellContext,
    targetId: string
  ): { follower: FollowerInstance; field: PlayerField; index: number; playerId: PlayerId } | null {
    const { gameState } = context;

    // player1のフィールドを検索
    const p1Index = gameState.board.player1Field.followers.findIndex(
      (f) => f?.instanceId === targetId
    );
    if (p1Index !== -1) {
      const follower = gameState.board.player1Field.followers[p1Index];
      if (follower) {
        return {
          follower,
          field: gameState.board.player1Field,
          index: p1Index,
          playerId: 'player1',
        };
      }
    }

    // player2のフィールドを検索
    const p2Index = gameState.board.player2Field.followers.findIndex(
      (f) => f?.instanceId === targetId
    );
    if (p2Index !== -1) {
      const follower = gameState.board.player2Field.followers[p2Index];
      if (follower) {
        return {
          follower,
          field: gameState.board.player2Field,
          index: p2Index,
          playerId: 'player2',
        };
      }
    }

    return null;
  }

  /**
   * 相手プレイヤーのフィールドを取得
   */
  protected getOpponentField(context: SpellContext): PlayerField {
    return context.castingPlayer === 'player1'
      ? context.gameState.board.player2Field
      : context.gameState.board.player1Field;
  }

  /**
   * 自分のフィールドを取得
   */
  protected getOwnField(context: SpellContext): PlayerField {
    return context.castingPlayer === 'player1'
      ? context.gameState.board.player1Field
      : context.gameState.board.player2Field;
  }

  /**
   * 相手プレイヤーIDを取得
   */
  protected getOpponentId(context: SpellContext): PlayerId {
    return context.castingPlayer === 'player1' ? 'player2' : 'player1';
  }
}

/**
 * 複合効果を実行するCompositeコマンド
 */
export class CompositeSpellCommand extends SpellCommand {
  private commands: SpellCommand[];

  constructor(commands: SpellCommand[]) {
    super();
    this.commands = commands;
  }

  execute(context: SpellContext): SpellEffectResult {
    for (const command of this.commands) {
      const result = command.execute(context);
      if (!result.success) {
        return result;
      }
    }
    return { success: true };
  }

  canExecute(context: SpellContext): boolean {
    return this.commands.every((cmd) => cmd.canExecute(context));
  }
}
