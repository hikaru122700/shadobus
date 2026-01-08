'use client';

import { useEffect, useState } from 'react';
import { PlayerId } from '@/types/game.types';

interface LeaderDamageEffectProps {
  damage: number;
  targetPlayerId: PlayerId;
  onComplete: () => void;
}

export function LeaderDamageEffect({
  damage,
  targetPlayerId,
  onComplete,
}: LeaderDamageEffectProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // リーダー要素の位置を取得
    const leaderElement = document.querySelector(`[data-leader-id="${targetPlayerId}"]`);
    if (leaderElement) {
      const rect = leaderElement.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    // 0.5秒後にエフェクト終了
    const timer = setTimeout(() => {
      onComplete();
    }, 500);

    return () => clearTimeout(timer);
  }, [targetPlayerId, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className="absolute animate-damage-popup"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span className="text-6xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
          -{damage}
        </span>
      </div>
    </div>
  );
}
