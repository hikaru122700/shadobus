import { v4 as uuidv4 } from 'uuid';
import { SpellCommand } from './base';
import { SpellContext, SpellEffectResult, DrawEffect } from '@/types/spell.types';
import { MAX_HAND_SIZE } from '@/types/game.types';
import { getCardDefinition } from '@/data/sample-cards';

/**
 * ドロー効果コマンド
 */
export class DrawCommand extends SpellCommand {
  constructor(private effect: DrawEffect) {
    super();
  }

  execute(context: SpellContext): SpellEffectResult {
    const { gameState, castingPlayer } = context;
    const player = gameState.players[castingPlayer];
    let drawnCount = 0;

    for (let i = 0; i < this.effect.count; i++) {
      if (player.deck.length === 0) {
        break;
      }
      if (player.hand.length >= MAX_HAND_SIZE) {
        break;
      }

      const cardId = player.deck.pop();
      if (cardId) {
        const definition = getCardDefinition(cardId);
        player.hand.push({
          instanceId: uuidv4(),
          definitionId: cardId,
          cardType: definition?.type || 'follower',
        });
        drawnCount++;
      }
    }

    return {
      success: true,
      message: `${drawnCount}枚ドローした`,
    };
  }

  canExecute(context: SpellContext): boolean {
    const player = context.gameState.players[context.castingPlayer];
    return player.deck.length > 0 && player.hand.length < MAX_HAND_SIZE;
  }
}
