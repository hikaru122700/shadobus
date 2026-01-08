'use client';

import { useEffect, useState, useCallback } from 'react';

interface AttackLineProps {
  startElementId: string | null;
  isActive: boolean;
}

export function AttackLine({ startElementId, isActive }: AttackLineProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const updateStartPos = useCallback(() => {
    if (startElementId) {
      const element = document.querySelector(`[data-follower-id="${startElementId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setStartPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    }
  }, [startElementId]);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    updateStartPos();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', updateStartPos);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', updateStartPos);
    };
  }, [isActive, updateStartPos]);

  if (!isActive || !startElementId) return null;

  const dx = mousePos.x - startPos.x;
  const dy = mousePos.y - startPos.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* 攻撃ライン */}
      <div
        className="absolute bg-gradient-to-r from-yellow-400 to-red-500 h-1 origin-left rounded-full shadow-lg"
        style={{
          left: startPos.x,
          top: startPos.y,
          width: length,
          transform: `rotate(${angle}deg)`,
        }}
      />
      {/* 矢印の先端 */}
      <div
        className="absolute w-4 h-4 border-t-4 border-r-4 border-red-500"
        style={{
          left: mousePos.x - 8,
          top: mousePos.y - 8,
          transform: `rotate(${angle + 45}deg)`,
        }}
      />
      {/* カーソル位置のエフェクト */}
      <div
        className="absolute w-8 h-8 rounded-full border-2 border-red-400 animate-ping"
        style={{
          left: mousePos.x - 16,
          top: mousePos.y - 16,
        }}
      />
    </div>
  );
}
