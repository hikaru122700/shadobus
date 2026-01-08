import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  PlayerId,
  PlayerField,
  MAX_FOLLOWERS_PER_FIELD,
  MAX_HAND_SIZE,
  STARTING_HEALTH,
} from '@/types/game.types';
import { FollowerInstance, HandCard } from '@/types/card.types';
import { getCardDefinition, generateRandomDeck } from '@/data/sample-cards';
import {
  calculateCombat,
  getValidAttackTargets,
  canFollowerAttack,
} from '@/lib/game-logic/combat';
import {
  canPlaceFollower,
  createFollowerInstance,
  findEmptySlot,
} from '@/lib/game-logic/placement';

// リーダー攻撃用の特別なID
export const LEADER_TARGET_ID = 'leader';

const createEmptyField = (): PlayerField => ({
  followers: Array(MAX_FOLLOWERS_PER_FIELD).fill(null),
});

// 初期デッキを作成（30枚のランダムデッキ）
function createInitialDeck(): string[] {
  return generateRandomDeck(30);
}

const createInitialState = (): GameState => ({
  phase: 'waiting',
  turnPhase: 'main',
  currentTurn: 'player1',
  turnNumber: 1,
  board: {
    player1Field: createEmptyField(),
    player2Field: createEmptyField(),
  },
  players: {
    player1: {
      id: 'player1',
      deck: [],
      hand: [],
      currentPP: 1,
      maxPP: 1,
      health: STARTING_HEALTH,
    },
    player2: {
      id: 'player2',
      deck: [],
      hand: [],
      currentPP: 1,
      maxPP: 1,
      health: STARTING_HEALTH,
    },
  },
  selection: {
    selectedAttacker: null,
    validTargets: [],
    mode: 'none',
  },
});

interface GameActions {
  startGame: () => void;
  endTurn: () => void;
  playCard: (cardInstanceId: string) => void;
  handleFollowerClick: (playerId: PlayerId, followerId: string) => void;
  handleLeaderClick: (playerId: PlayerId) => void;
  handleEmptySlotClick: (playerId: PlayerId, slotIndex: number) => void;
  selectAttacker: (followerId: string) => void;
  executeAttack: (targetId: string) => void;
  cancelSelection: () => void;
  addCardToHand: (playerId: PlayerId, cardDefinitionId: string) => void;
  drawCard: (playerId: PlayerId) => void;
  resetGame: () => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...createInitialState(),

    startGame: () => {
      set((state) => {
        // デッキを初期化
        state.players.player1.deck = createInitialDeck();
        state.players.player2.deck = createInitialDeck();

        // 初期手札を3枚引く
        for (let i = 0; i < 3; i++) {
          const card1 = state.players.player1.deck.pop();
          if (card1) {
            state.players.player1.hand.push({
              instanceId: uuidv4(),
              definitionId: card1,
            });
          }
          const card2 = state.players.player2.deck.pop();
          if (card2) {
            state.players.player2.hand.push({
              instanceId: uuidv4(),
              definitionId: card2,
            });
          }
        }

        state.phase = 'playing';
        state.turnPhase = 'main';
      });
    },

    endTurn: () => {
      set((state) => {
        const nextPlayer =
          state.currentTurn === 'player1' ? 'player2' : 'player1';

        if (nextPlayer === 'player1') {
          state.turnNumber += 1;
        }

        state.currentTurn = nextPlayer;

        const player = state.players[nextPlayer];
        if (player.maxPP < 10) {
          player.maxPP += 1;
        }
        player.currentPP = player.maxPP;

        // ターン開始時に1枚ドロー
        if (player.deck.length > 0 && player.hand.length < MAX_HAND_SIZE) {
          const cardId = player.deck.pop();
          if (cardId) {
            player.hand.push({
              instanceId: uuidv4(),
              definitionId: cardId,
            });
          }
        }

        const field =
          nextPlayer === 'player1'
            ? state.board.player1Field
            : state.board.player2Field;

        field.followers.forEach((follower) => {
          if (follower) {
            follower.hasAttacked = false;
            follower.canAttack = true;
          }
        });

        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
        };
      });
    },

    playCard: (cardInstanceId: string) => {
      const state = get();
      const currentPlayer = state.players[state.currentTurn];

      const cardIndex = currentPlayer.hand.findIndex(
        (c) => c.instanceId === cardInstanceId
      );
      if (cardIndex === -1) return;

      const card = currentPlayer.hand[cardIndex];
      const definition = getCardDefinition(card.definitionId);
      if (!definition) return;

      const field =
        state.currentTurn === 'player1'
          ? state.board.player1Field
          : state.board.player2Field;

      const { canPlace } = canPlaceFollower(
        field,
        definition.cost,
        currentPlayer.currentPP
      );

      if (!canPlace) return;

      set((state) => {
        const player = state.players[state.currentTurn];
        const field =
          state.currentTurn === 'player1'
            ? state.board.player1Field
            : state.board.player2Field;

        player.hand.splice(cardIndex, 1);
        player.currentPP -= definition.cost;

        const follower = createFollowerInstance(definition, state.turnNumber);
        const slotIndex = findEmptySlot(field);
        field.followers[slotIndex] = follower;
      });
    },

    handleFollowerClick: (playerId: PlayerId, followerId: string) => {
      const state = get();

      if (state.selection.mode === 'selectTarget') {
        if (state.selection.validTargets.includes(followerId)) {
          get().executeAttack(followerId);
        } else {
          get().cancelSelection();
        }
        return;
      }

      if (playerId === state.currentTurn) {
        const field =
          playerId === 'player1'
            ? state.board.player1Field
            : state.board.player2Field;

        const follower = field.followers.find(
          (f) => f?.instanceId === followerId
        );

        if (follower && canFollowerAttack(follower, state.turnNumber)) {
          get().selectAttacker(followerId);
        }
      }
    },

    handleLeaderClick: (playerId: PlayerId) => {
      const state = get();

      // 攻撃対象選択中で、相手のリーダーがターゲットの場合
      if (state.selection.mode === 'selectTarget' && playerId !== state.currentTurn) {
        if (state.selection.validTargets.includes(LEADER_TARGET_ID)) {
          get().executeAttack(LEADER_TARGET_ID);
        }
      }
    },

    handleEmptySlotClick: (_playerId: PlayerId, _slotIndex: number) => {
      get().cancelSelection();
    },

    selectAttacker: (followerId: string) => {
      set((state) => {
        // 攻撃者を取得
        const attackerField =
          state.currentTurn === 'player1'
            ? state.board.player1Field
            : state.board.player2Field;

        const attacker = attackerField.followers.find(
          (f) => f?.instanceId === followerId
        );

        // フォロワーへの有効なターゲットを取得
        const followerTargets = getValidAttackTargets(
          state.currentTurn,
          state.board
        );

        // リーダーへの攻撃が可能かチェック
        // Storm持ち、または召喚酔いでない場合にリーダーを攻撃可能
        // Ward持ちがいない場合のみ
        const opponentField =
          state.currentTurn === 'player1'
            ? state.board.player2Field
            : state.board.player1Field;

        const hasWard = opponentField.followers.some(
          (f) => f && f.abilities.includes('Ward')
        );

        let canAttackLeader = false;
        if (attacker && !hasWard) {
          const justPlayed = attacker.turnPlayed === state.turnNumber;
          if (!justPlayed) {
            // 召喚酔いでなければリーダーを攻撃可能
            canAttackLeader = true;
          } else if (attacker.abilities.includes('Storm')) {
            // Storm持ちは出したターンでもリーダーを攻撃可能
            canAttackLeader = true;
          }
          // Rush持ちは出したターンにはフォロワーしか攻撃できない
        }

        const validTargets = canAttackLeader
          ? [...followerTargets, LEADER_TARGET_ID]
          : followerTargets;

        state.selection = {
          selectedAttacker: followerId,
          validTargets,
          mode: validTargets.length > 0 ? 'selectTarget' : 'selectAttacker',
        };
      });
    },

    executeAttack: (targetId: string) => {
      set((state) => {
        const attackerId = state.selection.selectedAttacker;
        if (!attackerId) return;

        const attackerField =
          state.currentTurn === 'player1'
            ? state.board.player1Field
            : state.board.player2Field;

        const attackerIndex = attackerField.followers.findIndex(
          (f) => f?.instanceId === attackerId
        );

        if (attackerIndex === -1) return;

        const attacker = attackerField.followers[attackerIndex]!;

        // リーダーへの攻撃
        if (targetId === LEADER_TARGET_ID) {
          const opponentId =
            state.currentTurn === 'player1' ? 'player2' : 'player1';
          state.players[opponentId].health -= attacker.currentAttack;
          attacker.hasAttacked = true;

          // ドレイン: リーダーへの攻撃時も回復
          if (attacker.abilities.includes('Drain')) {
            const currentPlayer = state.players[state.currentTurn];
            currentPlayer.health = Math.min(
              STARTING_HEALTH,
              currentPlayer.health + attacker.currentAttack
            );
          }

          // 勝利判定
          if (state.players[opponentId].health <= 0) {
            state.phase = 'ended';
          }
        } else {
          // フォロワーへの攻撃
          const defenderField =
            state.currentTurn === 'player1'
              ? state.board.player2Field
              : state.board.player1Field;

          const defenderIndex = defenderField.followers.findIndex(
            (f) => f?.instanceId === targetId
          );

          if (defenderIndex === -1) return;

          const defender = defenderField.followers[defenderIndex]!;
          const result = calculateCombat(attacker, defender);

          attacker.currentHealth = result.attackerNewHealth;
          defender.currentHealth = result.defenderNewHealth;
          attacker.hasAttacked = true;

          // ドレイン: フォロワーへの攻撃時に回復
          if (result.drainAmount > 0) {
            const currentPlayer = state.players[state.currentTurn];
            currentPlayer.health = Math.min(
              STARTING_HEALTH,
              currentPlayer.health + result.drainAmount
            );
          }

          if (result.attackerDestroyed) {
            attackerField.followers[attackerIndex] = null;
          }
          if (result.defenderDestroyed) {
            defenderField.followers[defenderIndex] = null;
          }
        }

        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
        };
      });
    },

    cancelSelection: () => {
      set((state) => {
        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
        };
      });
    },

    addCardToHand: (playerId: PlayerId, cardDefinitionId: string) => {
      set((state) => {
        const handCard: HandCard = {
          instanceId: uuidv4(),
          definitionId: cardDefinitionId,
        };
        state.players[playerId].hand.push(handCard);
      });
    },

    drawCard: (playerId: PlayerId) => {
      set((state) => {
        const player = state.players[playerId];
        if (player.deck.length > 0 && player.hand.length < MAX_HAND_SIZE) {
          const cardId = player.deck.pop();
          if (cardId) {
            player.hand.push({
              instanceId: uuidv4(),
              definitionId: cardId,
            });
          }
        }
      });
    },

    resetGame: () => {
      set(() => createInitialState());
    },
  }))
);
