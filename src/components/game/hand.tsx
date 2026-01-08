'use client';

import { HandCard, FollowerCardDefinition } from '@/types/card.types';
import { useGameStore } from '@/store/game-store';
import { Card } from './card';
import { getCardDefinition } from '@/data/sample-cards';

interface HandProps {
  cards: HandCard[];
  currentPP: number;
  isActivePlayer: boolean;
  onCardDetailView?: (definition: FollowerCardDefinition) => void;
}

export function Hand({ cards, currentPP, isActivePlayer, onCardDetailView }: HandProps) {
  const playCard = useGameStore((state) => state.playCard);
  const turnPhase = useGameStore((state) => state.turnPhase);

  const handleCardClick = (card: HandCard) => {
    if (!isActivePlayer || turnPhase !== 'main') return;

    const definition = getCardDefinition(card.definitionId);
    if (definition && definition.cost <= currentPP) {
      playCard(card.instanceId);
    }
  };

  return (
    <div className="flex justify-center gap-2 p-4 bg-gray-800/50 rounded-xl min-h-[160px]">
      {cards.map((card) => {
        const definition = getCardDefinition(card.definitionId);
        if (!definition) return null;

        const canAfford = definition.cost <= currentPP;

        return (
          <Card
            key={card.instanceId}
            definition={definition}
            inHand
            canBePlayed={canAfford && isActivePlayer}
            onClick={() => handleCardClick(card)}
            onDetailView={() => onCardDetailView?.(definition)}
          />
        );
      })}

      {cards.length === 0 && (
        <div className="flex items-center justify-center text-gray-500 italic">
          手札がありません
        </div>
      )}
    </div>
  );
}
