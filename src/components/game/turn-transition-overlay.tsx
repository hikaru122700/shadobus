'use client';

import { PlayerId } from '@/types/game.types';

interface TurnTransitionOverlayProps {
  isActive: boolean;
  newTurn: PlayerId | null;
}

export function TurnTransitionOverlay({ isActive, newTurn }: TurnTransitionOverlayProps) {
  if (!isActive || !newTurn) return null;

  const isPlayerTurn = newTurn === 'player1';
  const text = isPlayerTurn ? 'あなたのターン' : '相手のターン';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-turn-overlay">
      {/* 暗いバックドロップ */}
      <div className="absolute inset-0 bg-black/60 animate-fade-in-out" />

      {/* メインテキストコンテナ */}
      <div className={`relative z-10 text-center animate-turn-text ${isPlayerTurn ? 'text-blue-400' : 'text-red-400'}`}>
        {/* メインテキスト */}
        <div className="text-6xl font-bold tracking-wider drop-shadow-glow">
          {text}
        </div>

        {/* 装飾ライン */}
        <div
          className={`mt-4 h-1 mx-auto animate-line-expand ${
            isPlayerTurn
              ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent'
              : 'bg-gradient-to-r from-transparent via-red-400 to-transparent'
          }`}
        />
      </div>
    </div>
  );
}
