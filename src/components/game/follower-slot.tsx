'use client';

import { FollowerInstance } from '@/types/card.types';
import { Card } from './card';
import { getCardDefinition } from '@/data/sample-cards';

interface FollowerSlotProps {
  follower: FollowerInstance | null;
  slotIndex: number;
  isSelected: boolean;
  isValidTarget: boolean;
  isEmptyTargetable: boolean;
  onClick: () => void;
  onMouseUp?: () => void;
  onMouseDown?: () => void;
  onDetailView?: () => void;
}

export function FollowerSlot({
  follower,
  isSelected,
  isValidTarget,
  isEmptyTargetable,
  onClick,
  onMouseUp,
  onMouseDown,
  onDetailView,
}: FollowerSlotProps) {
  if (!follower) {
    return (
      <div
        className={`
          w-24 h-36 rounded-lg border-2 border-dashed
          ${isEmptyTargetable ? 'border-green-400 bg-green-900/20' : 'border-gray-700 bg-gray-800/30'}
          flex items-center justify-center
          cursor-pointer hover:bg-gray-700/30 transition-colors
        `}
        onClick={onClick}
      >
        <span className="text-gray-600 text-xs">空きスロット</span>
      </div>
    );
  }

  const definition = getCardDefinition(follower.definitionId);
  if (!definition) return null;

  return (
    <Card
      definition={definition}
      instance={follower}
      isSelected={isSelected}
      isValidTarget={isValidTarget}
      onClick={onClick}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
      onDetailView={onDetailView}
    />
  );
}
