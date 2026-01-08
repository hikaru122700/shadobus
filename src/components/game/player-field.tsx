'use client';

import { FollowerInstance, CardDefinition } from '@/types/card.types';
import { PlayerId } from '@/types/game.types';
import { FollowerSlot } from './follower-slot';
import { getCardDefinition } from '@/data/sample-cards';

interface PlayerFieldProps {
  playerId: PlayerId;
  followers: (FollowerInstance | null)[];
  isCurrentPlayer: boolean;
  selectedAttacker: string | null;
  validTargets: string[];
  onSlotClick: (index: number, follower: FollowerInstance | null) => void;
  onSlotMouseUp?: (index: number, follower: FollowerInstance | null) => void;
  onSlotMouseDown?: (index: number, follower: FollowerInstance | null) => void;
  onCardDetailView?: (definition: CardDefinition, instance: FollowerInstance) => void;
}

export function PlayerField({
  playerId,
  followers,
  isCurrentPlayer,
  selectedAttacker,
  validTargets,
  onSlotClick,
  onSlotMouseUp,
  onSlotMouseDown,
  onCardDetailView,
}: PlayerFieldProps) {
  return (
    <div
      className={`
        flex justify-center gap-3 p-4 rounded-xl
        ${isCurrentPlayer ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-red-900/30 border border-red-700/50'}
      `}
    >
      {followers.map((follower, index) => {
        const definition = follower ? getCardDefinition(follower.definitionId) : null;
        return (
          <FollowerSlot
            key={`${playerId}-slot-${index}`}
            follower={follower}
            slotIndex={index}
            isSelected={follower?.instanceId === selectedAttacker}
            isValidTarget={
              follower ? validTargets.includes(follower.instanceId) : false
            }
            isEmptyTargetable={!follower && isCurrentPlayer}
            onClick={() => onSlotClick(index, follower)}
            onMouseUp={() => onSlotMouseUp?.(index, follower)}
            onMouseDown={() => onSlotMouseDown?.(index, follower)}
            onDetailView={
              follower && definition
                ? () => onCardDetailView?.(definition, follower)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
