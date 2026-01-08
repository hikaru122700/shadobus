'use client';

import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { PlayerField } from './player-field';
import { AttackLine } from './attack-line';
import { FollowerInstance, CardDefinition } from '@/types/card.types';
import { canFollowerAttack } from '@/lib/game-logic/combat';

interface BoardProps {
  onCardDetailView?: (definition: CardDefinition, instance?: FollowerInstance) => void;
}

export function Board({ onCardDetailView }: BoardProps) {
  const board = useGameStore((state) => state.board);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const turnNumber = useGameStore((state) => state.turnNumber);
  const selection = useGameStore((state) => state.selection);
  const handleFollowerClick = useGameStore((state) => state.handleFollowerClick);
  const handleEmptySlotClick = useGameStore((state) => state.handleEmptySlotClick);
  const selectAttacker = useGameStore((state) => state.selectAttacker);
  const executeAttack = useGameStore((state) => state.executeAttack);
  const cancelSelection = useGameStore((state) => state.cancelSelection);
  const selectSpellTarget = useGameStore((state) => state.selectSpellTarget);

  // マウスアップで攻撃をキャンセル（ターゲット外でリリースした場合）
  const handleGlobalMouseUp = useCallback(() => {
    // 少し遅延させて、ターゲット上でのmouseUpが先に処理されるようにする
    setTimeout(() => {
      if (selection.mode === 'selectTarget') {
        cancelSelection();
      }
    }, 50);
  }, [selection.mode, cancelSelection]);

  useEffect(() => {
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseUp]);

  // 自分のフォロワーをマウスダウンで攻撃者として選択
  const handlePlayer1MouseDown = (
    _index: number,
    follower: FollowerInstance | null
  ) => {
    if (currentTurn !== 'player1' || !follower) return;
    if (canFollowerAttack(follower, turnNumber)) {
      selectAttacker(follower.instanceId);
    }
  };

  // 相手フォロワー上でマウスアップで攻撃実行
  const handlePlayer2MouseUp = (
    _index: number,
    follower: FollowerInstance | null
  ) => {
    if (selection.mode === 'selectTarget' && follower) {
      if (selection.validTargets.includes(follower.instanceId)) {
        executeAttack(follower.instanceId);
      }
    }
  };

  const handlePlayer1SlotClick = (
    index: number,
    follower: FollowerInstance | null
  ) => {
    // スペルターゲット選択モードの場合
    if (selection.mode === 'spell_target' && follower) {
      if (selection.validTargets.includes(follower.instanceId)) {
        selectSpellTarget(follower.instanceId);
        return;
      }
    }
    if (follower) {
      handleFollowerClick('player1', follower.instanceId);
    } else {
      handleEmptySlotClick('player1', index);
    }
  };

  const handlePlayer2SlotClick = (
    index: number,
    follower: FollowerInstance | null
  ) => {
    // スペルターゲット選択モードの場合
    if (selection.mode === 'spell_target' && follower) {
      if (selection.validTargets.includes(follower.instanceId)) {
        selectSpellTarget(follower.instanceId);
        return;
      }
    }
    if (follower) {
      handleFollowerClick('player2', follower.instanceId);
    } else {
      handleEmptySlotClick('player2', index);
    }
  };

  const isAttacking = selection.mode === 'selectTarget';
  const isSpellTargeting = selection.mode === 'spell_target';

  return (
    <div className="flex flex-col gap-6 p-4 relative">
      {/* 攻撃ライン */}
      <AttackLine
        startElementId={selection.selectedAttacker}
        isActive={isAttacking}
      />

      {/* 相手フィールド（上） */}
      <div>
        <div className="text-center text-gray-400 text-sm mb-2">
          相手のフィールド
        </div>
        <PlayerField
          playerId="player2"
          followers={board.player2Field.followers}
          isCurrentPlayer={currentTurn === 'player2'}
          selectedAttacker={selection.selectedAttacker}
          validTargets={selection.validTargets}
          onSlotClick={handlePlayer2SlotClick}
          onSlotMouseUp={handlePlayer2MouseUp}
          onCardDetailView={onCardDetailView}
        />
      </div>

      {/* 中央ライン */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
        <div className={`text-sm px-4 ${isAttacking ? 'text-red-400 font-bold' : isSpellTargeting ? 'text-purple-400 font-bold' : 'text-gray-500'}`}>
          {isAttacking ? '⚔️ 攻撃中' : isSpellTargeting ? '✨ スペル発動' : 'VS'}
        </div>
        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
      </div>

      {/* 自分フィールド（下） */}
      <div>
        <div className="text-center text-gray-400 text-sm mb-2">
          あなたのフィールド
          {currentTurn === 'player1' && (
            <span className="text-blue-400 ml-2 text-xs">
              (ドラッグで攻撃)
            </span>
          )}
        </div>
        <PlayerField
          playerId="player1"
          followers={board.player1Field.followers}
          isCurrentPlayer={currentTurn === 'player1'}
          selectedAttacker={selection.selectedAttacker}
          validTargets={selection.validTargets}
          onSlotClick={handlePlayer1SlotClick}
          onSlotMouseDown={handlePlayer1MouseDown}
          onCardDetailView={onCardDetailView}
        />
      </div>
    </div>
  );
}
