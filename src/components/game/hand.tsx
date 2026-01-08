'use client';

import {
  HandCard,
  CardDefinition,
  SpellCardDefinition,
} from '@/types/card.types';
import { useGameStore } from '@/store/game-store';
import { Card } from './card';
import { getCardDefinition } from '@/data/sample-cards';

interface HandProps {
  cards: HandCard[];
  currentPP: number;
  isActivePlayer: boolean;
  onCardDetailView?: (definition: CardDefinition) => void;
}

export function Hand({ cards, currentPP, isActivePlayer, onCardDetailView }: HandProps) {
  const playCard = useGameStore((state) => state.playCard);
  const initiateSpell = useGameStore((state) => state.initiateSpell);
  const turnPhase = useGameStore((state) => state.turnPhase);

  const handleCardClick = (card: HandCard, cardIndex: number) => {
    if (!isActivePlayer || turnPhase !== 'main') return;

    const definition = getCardDefinition(card.definitionId);
    if (!definition || definition.cost > currentPP) return;

    if (definition.type === 'spell') {
      // スペルカードの場合
      const spellDef = definition as SpellCardDefinition;
      if (spellDef.targetType === 'none' || spellDef.targetType === 'all_enemies') {
        // ターゲット不要のスペルは直接発動
        playCard(card.instanceId);
      } else {
        // ターゲットが必要なスペルはターゲット選択モードへ
        initiateSpell(spellDef, cardIndex);
      }
    } else {
      // フォロワーカードの場合
      playCard(card.instanceId);
    }
  };

  return (
    <div className="flex justify-center gap-2 p-4 bg-gray-800/50 rounded-xl min-h-[160px]">
      {cards.map((card, index) => {
        const definition = getCardDefinition(card.definitionId);
        if (!definition) return null;

        const canAfford = definition.cost <= currentPP;

        return (
          <Card
            key={card.instanceId}
            definition={definition}
            inHand
            canBePlayed={canAfford && isActivePlayer}
            onClick={() => handleCardClick(card, index)}
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
