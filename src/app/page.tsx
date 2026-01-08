'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGameStore, LEADER_TARGET_ID } from '@/store/game-store';
import { Board } from '@/components/game/board';
import { Hand } from '@/components/game/hand';
import { TurnTransitionOverlay } from '@/components/game/turn-transition-overlay';
import { CardDetailPanel } from '@/components/game/card-detail-panel';
import { PlayerId } from '@/types/game.types';
import { FollowerCardDefinition, FollowerInstance } from '@/types/card.types';

export default function GamePage() {
  const phase = useGameStore((state) => state.phase);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const turnNumber = useGameStore((state) => state.turnNumber);
  const players = useGameStore((state) => state.players);
  const selection = useGameStore((state) => state.selection);
  const startGame = useGameStore((state) => state.startGame);
  const endTurn = useGameStore((state) => state.endTurn);
  const cancelSelection = useGameStore((state) => state.cancelSelection);
  const handleLeaderClick = useGameStore((state) => state.handleLeaderClick);
  const executeAttack = useGameStore((state) => state.executeAttack);
  const resetGame = useGameStore((state) => state.resetGame);

  // ターン切り替え演出のステート
  const [turnTransition, setTurnTransition] = useState<{
    isActive: boolean;
    newTurn: PlayerId | null;
  }>({ isActive: false, newTurn: null });
  const prevTurnRef = useRef<PlayerId>(currentTurn);

  // カード詳細パネルのステート
  const [detailedCard, setDetailedCard] = useState<{
    definition: FollowerCardDefinition;
    instance?: FollowerInstance;
  } | null>(null);

  // カード詳細表示のコールバック
  const handleCardDetailView = (
    definition: FollowerCardDefinition,
    instance?: FollowerInstance
  ) => {
    setDetailedCard({ definition, instance });
  };

  const handleCloseDetailPanel = () => {
    setDetailedCard(null);
  };

  // リーダーへのドラッグ攻撃
  const handleLeaderMouseUp = () => {
    if (canAttackOpponentLeader) {
      executeAttack(LEADER_TARGET_ID);
    }
  };

  // ゲーム初期化
  useEffect(() => {
    if (phase === 'waiting') {
      startGame();
    }
  }, [phase, startGame]);

  // ターン切り替え演出
  useEffect(() => {
    if (phase === 'playing' && prevTurnRef.current !== currentTurn) {
      setTurnTransition({ isActive: true, newTurn: currentTurn });

      const timer = setTimeout(() => {
        setTurnTransition({ isActive: false, newTurn: null });
      }, 1500);

      prevTurnRef.current = currentTurn;
      return () => clearTimeout(timer);
    }
  }, [currentTurn, phase]);

  // 相手リーダーが攻撃対象かチェック
  const canAttackOpponentLeader =
    selection.mode === 'selectTarget' &&
    selection.validTargets.includes(LEADER_TARGET_ID);

  // 勝敗判定
  const winner =
    phase === 'ended'
      ? players.player1.health <= 0
        ? 'player2'
        : 'player1'
      : null;

  return (
    <main className="min-h-screen flex text-white">
      {/* 左サイドバー：自分のリーダー情報（下部配置） */}
      <aside className="w-36 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 justify-end">
        <div className="text-gray-400 text-sm mb-2">あなた</div>
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-4 border-blue-400 flex items-center justify-center mb-2 transition-all ${
            currentTurn === 'player1' ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
          }`}
        >
          <span className="text-4xl">👤</span>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs">HP</div>
          <div className="text-5xl font-bold text-green-400 drop-shadow-lg">
            {players.player1.health}
          </div>
        </div>
        <div className="mt-3 w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${Math.max(0, (players.player1.health / 20) * 100)}%` }}
          />
        </div>
        <div className="mt-4 text-center">
          <div className="text-gray-500 text-xs">デッキ</div>
          <div className="text-xl font-bold text-gray-300">{players.player1.deck.length}</div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col relative">
        {/* ヘッダー */}
        <header className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Link href="/cards" className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Shadobus
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-lg flex items-center gap-1">
              ターン {turnNumber} -{' '}
              <span
                key={currentTurn}
                className={`inline-block ${currentTurn === 'player1' ? 'text-blue-400' : 'text-red-400'} ${turnTransition.isActive ? 'animate-header-turn-change' : ''}`}
              >
                {currentTurn === 'player1' ? 'あなた' : '相手'}
              </span>
              のターン
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/cards"
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              カード一覧
            </Link>
            {selection.mode !== 'none' && (
              <button
                onClick={cancelSelection}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
            )}
            <button
              onClick={endTurn}
              disabled={phase === 'ended'}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              ターン終了
            </button>
          </div>
        </header>

        {/* 勝敗表示 */}
        {phase === 'ended' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-600">
              <div className="text-4xl mb-4">
                {winner === 'player1' ? '🎉' : '😢'}
              </div>
              <div className="text-3xl font-bold mb-4">
                {winner === 'player1' ? 'あなたの勝利！' : '相手の勝利...'}
              </div>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                もう一度プレイ
              </button>
            </div>
          </div>
        )}

        {/* ターン切り替え演出 */}
        <TurnTransitionOverlay
          isActive={turnTransition.isActive}
          newTurn={turnTransition.newTurn}
        />

        {/* カード詳細パネル */}
        {detailedCard && (
          <CardDetailPanel
            definition={detailedCard.definition}
            instance={detailedCard.instance}
            onClose={handleCloseDetailPanel}
          />
        )}

        {/* 相手の手札 */}
        <div className="p-2 bg-gray-800/50">
          <div className="text-center text-gray-500 text-xs mb-1">
            相手の手札 ({players.player2.hand.length} 枚) | デッキ: {players.player2.deck.length}
          </div>
          {currentTurn === 'player2' ? (
            <Hand
              cards={players.player2.hand}
              currentPP={players.player2.currentPP}
              isActivePlayer={true}
              onCardDetailView={handleCardDetailView}
            />
          ) : (
            <div className="flex justify-center gap-2 min-h-[140px] items-center">
              {players.player2.hand.map((_, index) => (
                <div
                  key={index}
                  className="w-20 h-28 rounded-lg bg-gradient-to-b from-purple-900 to-purple-950 border-2 border-purple-700"
                />
              ))}
            </div>
          )}
        </div>

        {/* ゲーム盤面 */}
        <div className="flex-1 flex items-center justify-center py-2">
          <Board onCardDetailView={handleCardDetailView} />
        </div>

        {/* 自分の手札 */}
        <div className="p-2 bg-gray-800/50">
          <div className="text-center text-gray-500 text-xs mb-1">
            あなたの手札 ({players.player1.hand.length} 枚)
          </div>
          <Hand
            cards={players.player1.hand}
            currentPP={players.player1.currentPP}
            isActivePlayer={currentTurn === 'player1'}
            onCardDetailView={handleCardDetailView}
          />
        </div>

        {/* フッター：ステータス表示 */}
        <footer className="bg-gray-800 p-2 flex justify-center items-center border-t border-gray-700">
          <div className="text-gray-400 text-sm">
            {selection.mode === 'selectTarget'
              ? canAttackOpponentLeader
                ? '⚔️ 相手にドラッグして攻撃（リーダーも可）'
                : '⚔️ 相手フォロワーにドラッグして攻撃'
              : selection.mode === 'selectAttacker'
              ? '❌ 攻撃できる敵がいません'
              : '💡 フォロワーをドラッグして攻撃'}
          </div>
        </footer>
      </div>

      {/* 右サイドバー：相手のリーダー情報 + PP表示 */}
      <aside className="w-36 bg-gray-800 border-l border-gray-700 flex flex-col items-center py-4">
        <div className="text-gray-400 text-sm mb-2">相手 (AI)</div>
        <div
          onClick={() => handleLeaderClick('player2')}
          onMouseUp={handleLeaderMouseUp}
          data-leader-id="player2"
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 flex items-center justify-center mb-2 transition-all cursor-pointer select-none ${
            canAttackOpponentLeader
              ? 'border-yellow-400 ring-4 ring-yellow-400 ring-opacity-50 animate-pulse scale-110'
              : 'border-red-400'
          } ${currentTurn === 'player2' ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}`}
        >
          <span className="text-4xl">🤖</span>
        </div>
        {canAttackOpponentLeader && (
          <div className="text-yellow-400 text-xs mb-1 animate-bounce">ドラッグで攻撃！</div>
        )}
        <div className="text-center">
          <div className="text-gray-400 text-xs">HP</div>
          <div className="text-5xl font-bold text-red-400 drop-shadow-lg">
            {players.player2.health}
          </div>
        </div>
        <div className="mt-3 w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${Math.max(0, (players.player2.health / 20) * 100)}%` }}
          />
        </div>

        {/* PP表示（右下部） */}
        <div className="mt-auto">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
            <div className="text-gray-400 text-xs text-center mb-1">残りPP</div>
            <div className="text-center">
              <span className="text-4xl font-bold text-blue-400">
                {players[currentTurn].currentPP}
              </span>
              <span className="text-gray-500 text-xl">
                /{players[currentTurn].maxPP}
              </span>
            </div>
            <div className="flex gap-1 mt-2 justify-center flex-wrap max-w-[80px]">
              {Array.from({ length: players[currentTurn].maxPP }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < players[currentTurn].currentPP
                      ? 'bg-blue-500'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
