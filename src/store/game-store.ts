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
import { FollowerInstance, HandCard, SpellCardDefinition, FollowerCardDefinition } from '@/types/card.types';
import { SpellTargetType } from '@/types/spell.types';
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
import { executeSpellEffects } from '@/lib/spell-effects';

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
      evolutionPoints: 2,           // 先攻2回（ビヨンド仕様）
      superEvolutionPoints: 2,
      isFirstPlayer: true,
      hasEvolvedThisTurn: false,
      hasSuperEvolvedThisTurn: false,
    },
    player2: {
      id: 'player2',
      deck: [],
      hand: [],
      currentPP: 1,
      maxPP: 1,
      health: STARTING_HEALTH,
      evolutionPoints: 2,           // 後攻も2回（ビヨンド仕様）
      superEvolutionPoints: 2,
      isFirstPlayer: false,
      hasEvolvedThisTurn: false,
      hasSuperEvolvedThisTurn: false,
    },
  },
  selection: {
    selectedAttacker: null,
    validTargets: [],
    mode: 'none',
    pendingSpell: null,
    pendingSpellCardIndex: -1,
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
  // 進化アクション
  evolveFollower: (followerId: string) => void;
  superEvolveFollower: (followerId: string) => void;
  canEvolve: (followerId: string) => boolean;
  canSuperEvolve: (followerId: string) => boolean;
  // スペルアクション
  initiateSpell: (spellDef: SpellCardDefinition, cardIndex: number) => void;
  selectSpellTarget: (targetId: string) => void;
  castSpell: () => void;
  cancelSpell: () => void;
  getValidSpellTargets: (spellDef: SpellCardDefinition) => string[];
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
            const def1 = getCardDefinition(card1);
            state.players.player1.hand.push({
              instanceId: uuidv4(),
              definitionId: card1,
              cardType: def1?.type || 'follower',
            });
          }
          const card2 = state.players.player2.deck.pop();
          if (card2) {
            const def2 = getCardDefinition(card2);
            state.players.player2.hand.push({
              instanceId: uuidv4(),
              definitionId: card2,
              cardType: def2?.type || 'follower',
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
            const def = getCardDefinition(cardId);
            player.hand.push({
              instanceId: uuidv4(),
              definitionId: cardId,
              cardType: def?.type || 'follower',
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
            // 超進化した次のターンは自ターン耐性が消える
            follower.superEvolvedThisTurn = false;
          }
        });

        // 進化フラグをリセット（ビヨンド仕様：毎ターン進化/超進化可能）
        player.hasEvolvedThisTurn = false;
        player.hasSuperEvolvedThisTurn = false;

        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
          pendingSpell: null,
          pendingSpellCardIndex: -1,
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

      // PP足りているかチェック
      if (definition.cost > currentPlayer.currentPP) return;

      // スペルカードの場合
      if (definition.type === 'spell') {
        const spellDef = definition as SpellCardDefinition;

        // ターゲット不要のスペルは即座に発動
        if (spellDef.targetType === 'none') {
          set((state) => {
            const player = state.players[state.currentTurn];
            player.hand.splice(cardIndex, 1);
            player.currentPP -= spellDef.cost;

            // スペル効果を実行
            executeSpellEffects(spellDef.effects, {
              gameState: state,
              castingPlayer: state.currentTurn,
              targetIds: [],
            });
          });
        } else {
          // ターゲットが必要なスペルはターゲット選択モードへ
          get().initiateSpell(spellDef, cardIndex);
        }
        return;
      }

      // フォロワーカードの場合
      const followerDef = definition as FollowerCardDefinition;
      const field =
        state.currentTurn === 'player1'
          ? state.board.player1Field
          : state.board.player2Field;

      const { canPlace } = canPlaceFollower(
        field,
        followerDef.cost,
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
        player.currentPP -= followerDef.cost;

        const follower = createFollowerInstance(followerDef, state.turnNumber);
        const slotIndex = findEmptySlot(field);
        field.followers[slotIndex] = follower;
      });
    },

    handleFollowerClick: (playerId: PlayerId, followerId: string) => {
      const state = get();

      // スペルターゲット選択中
      if (state.selection.mode === 'spell_target') {
        if (state.selection.validTargets.includes(followerId)) {
          get().selectSpellTarget(followerId);
        }
        return;
      }

      // 攻撃ターゲット選択中
      if (state.selection.mode === 'selectTarget') {
        if (state.selection.validTargets.includes(followerId)) {
          get().executeAttack(followerId);
        } else {
          get().cancelSelection();
        }
        return;
      }

      // 自分のフォロワーをクリック → 攻撃者選択
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

      // スペルターゲット選択中で、リーダーがターゲットの場合
      if (state.selection.mode === 'spell_target') {
        if (state.selection.validTargets.includes(LEADER_TARGET_ID)) {
          get().selectSpellTarget(LEADER_TARGET_ID);
        }
        return;
      }

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
          pendingSpell: null,
          pendingSpellCardIndex: -1,
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

          // ビヨンド超進化：ふっとびダメージ（敵フォロワー撃破時リーダーに1ダメージ）
          if (result.knockbackDamage > 0) {
            const opponentId =
              state.currentTurn === 'player1' ? 'player2' : 'player1';
            state.players[opponentId].health -= result.knockbackDamage;

            // 勝利判定
            if (state.players[opponentId].health <= 0) {
              state.phase = 'ended';
            }
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
          pendingSpell: null,
          pendingSpellCardIndex: -1,
        };
      });
    },

    cancelSelection: () => {
      set((state) => {
        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
          pendingSpell: null,
          pendingSpellCardIndex: -1,
        };
      });
    },

    addCardToHand: (playerId: PlayerId, cardDefinitionId: string) => {
      set((state) => {
        const def = getCardDefinition(cardDefinitionId);
        const handCard: HandCard = {
          instanceId: uuidv4(),
          definitionId: cardDefinitionId,
          cardType: def?.type || 'follower',
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
            const def = getCardDefinition(cardId);
            player.hand.push({
              instanceId: uuidv4(),
              definitionId: cardId,
              cardType: def?.type || 'follower',
            });
          }
        }
      });
    },

    resetGame: () => {
      set(() => createInitialState());
    },

    // 進化可能かチェック（ビヨンド仕様）
    // - 先攻5ターン目、後攻4ターン目から
    // - EP残り、未進化、同ターン進化/超進化していない
    canEvolve: (followerId: string) => {
      const state = get();
      const player = state.players[state.currentTurn];

      // ターン条件チェック（先攻5T、後攻4T）
      const requiredTurn = player.isFirstPlayer ? 5 : 4;
      if (state.turnNumber < requiredTurn) return false;

      // EP残りチェック
      if (player.evolutionPoints <= 0) return false;

      // 同ターン進化/超進化済みチェック（排他）
      if (player.hasEvolvedThisTurn || player.hasSuperEvolvedThisTurn) return false;

      const field =
        state.currentTurn === 'player1'
          ? state.board.player1Field
          : state.board.player2Field;

      const follower = field.followers.find(
        (f) => f?.instanceId === followerId
      );

      if (!follower) return false;
      // 既に進化/超進化済みは不可
      if (follower.isEvolved || follower.isSuperEvolved) return false;

      return true;
    },

    // 超進化可能かチェック（ビヨンド仕様）
    // - 先攻7ターン目、後攻6ターン目から
    // - SEP残り、未進化・未超進化、同ターン進化/超進化していない
    canSuperEvolve: (followerId: string) => {
      const state = get();
      const player = state.players[state.currentTurn];

      // ターン条件チェック（先攻7T、後攻6T）
      const requiredTurn = player.isFirstPlayer ? 7 : 6;
      if (state.turnNumber < requiredTurn) return false;

      // SEP残りチェック
      if (player.superEvolutionPoints <= 0) return false;

      // 同ターン進化/超進化済みチェック（排他）
      if (player.hasEvolvedThisTurn || player.hasSuperEvolvedThisTurn) return false;

      const field =
        state.currentTurn === 'player1'
          ? state.board.player1Field
          : state.board.player2Field;

      const follower = field.followers.find(
        (f) => f?.instanceId === followerId
      );

      if (!follower) return false;
      // 既に進化済みは超進化不可（ビヨンド仕様）
      if (follower.isEvolved || follower.isSuperEvolved) return false;

      return true;
    },

    // 進化実行（ビヨンド仕様：攻撃+2、体力+2）
    evolveFollower: (followerId: string) => {
      const canEvolveResult = get().canEvolve(followerId);
      if (!canEvolveResult) return;

      set((state) => {
        const player = state.players[state.currentTurn];
        const field =
          state.currentTurn === 'player1'
            ? state.board.player1Field
            : state.board.player2Field;

        const follower = field.followers.find(
          (f) => f?.instanceId === followerId
        );

        if (!follower) return;

        // ステータス上昇（ビヨンド仕様：+2/+2）
        follower.currentAttack += 2;
        follower.currentHealth += 2;
        follower.maxHealth += 2;

        // 進化済みフラグ
        follower.isEvolved = true;

        // 進化後は攻撃可能に（召喚酔い解除）
        follower.canAttack = true;

        // EP消費
        player.evolutionPoints -= 1;

        // このターン進化済みフラグ
        player.hasEvolvedThisTurn = true;
      });
    },

    // 超進化実行（ビヨンド仕様）
    // - 攻撃+3、体力+3
    // - 自ターン中ダメージ無効、破壊耐性
    // - ふっとび（敵フォロワー撃破時リーダーに1ダメージ）
    superEvolveFollower: (followerId: string) => {
      const canSuperEvolveResult = get().canSuperEvolve(followerId);
      if (!canSuperEvolveResult) return;

      set((state) => {
        const player = state.players[state.currentTurn];
        const field =
          state.currentTurn === 'player1'
            ? state.board.player1Field
            : state.board.player2Field;

        const follower = field.followers.find(
          (f) => f?.instanceId === followerId
        );

        if (!follower) return;

        // ステータス上昇（ビヨンド仕様：+3/+3）
        follower.currentAttack += 3;
        follower.currentHealth += 3;
        follower.maxHealth += 3;

        // 超進化済みフラグ
        follower.isSuperEvolved = true;

        // このターン超進化フラグ（自ターン耐性用）
        follower.superEvolvedThisTurn = true;

        // 超進化後は攻撃可能に（召喚酔い解除）
        follower.canAttack = true;

        // SEP消費
        player.superEvolutionPoints -= 1;

        // このターン超進化済みフラグ
        player.hasSuperEvolvedThisTurn = true;
      });
    },

    // スペルターゲット選択を開始
    initiateSpell: (spellDef: SpellCardDefinition, cardIndex: number) => {
      const validTargets = get().getValidSpellTargets(spellDef);

      set((state) => {
        state.selection = {
          selectedAttacker: null,
          validTargets,
          mode: 'spell_target',
          pendingSpell: spellDef,
          pendingSpellCardIndex: cardIndex,
        };
      });
    },

    // スペルターゲットを選択して発動
    selectSpellTarget: (targetId: string) => {
      const state = get();
      if (!state.selection.pendingSpell) return;

      const spellDef = state.selection.pendingSpell;
      const cardIndex = state.selection.pendingSpellCardIndex;

      set((state) => {
        const player = state.players[state.currentTurn];

        // 手札から削除
        player.hand.splice(cardIndex, 1);
        player.currentPP -= spellDef.cost;

        // スペル効果を実行
        executeSpellEffects(spellDef.effects, {
          gameState: state,
          castingPlayer: state.currentTurn,
          targetIds: [targetId],
        });

        // 選択状態をリセット
        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
          pendingSpell: null,
          pendingSpellCardIndex: -1,
        };
      });
    },

    // スペルを即座に発動（ターゲット不要の場合）
    castSpell: () => {
      const state = get();
      if (!state.selection.pendingSpell) return;

      const spellDef = state.selection.pendingSpell;
      const cardIndex = state.selection.pendingSpellCardIndex;

      set((state) => {
        const player = state.players[state.currentTurn];

        // 手札から削除
        player.hand.splice(cardIndex, 1);
        player.currentPP -= spellDef.cost;

        // スペル効果を実行
        executeSpellEffects(spellDef.effects, {
          gameState: state,
          castingPlayer: state.currentTurn,
          targetIds: [],
        });

        // 選択状態をリセット
        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
          pendingSpell: null,
          pendingSpellCardIndex: -1,
        };
      });
    },

    // スペル発動をキャンセル
    cancelSpell: () => {
      set((state) => {
        state.selection = {
          selectedAttacker: null,
          validTargets: [],
          mode: 'none',
          pendingSpell: null,
          pendingSpellCardIndex: -1,
        };
      });
    },

    // スペルの有効なターゲットを取得
    getValidSpellTargets: (spellDef: SpellCardDefinition): string[] => {
      const state = get();
      const targets: string[] = [];

      const ownField =
        state.currentTurn === 'player1'
          ? state.board.player1Field
          : state.board.player2Field;

      const opponentField =
        state.currentTurn === 'player1'
          ? state.board.player2Field
          : state.board.player1Field;

      switch (spellDef.targetType) {
        case 'own_follower':
          ownField.followers.forEach((f) => {
            if (f) targets.push(f.instanceId);
          });
          break;

        case 'enemy_follower':
          opponentField.followers.forEach((f) => {
            if (f) targets.push(f.instanceId);
          });
          break;

        case 'any_follower':
          ownField.followers.forEach((f) => {
            if (f) targets.push(f.instanceId);
          });
          opponentField.followers.forEach((f) => {
            if (f) targets.push(f.instanceId);
          });
          break;

        case 'enemy_leader':
          targets.push(LEADER_TARGET_ID);
          break;

        case 'all_enemies':
          // AoEはターゲット選択不要だが、対象がいるか確認用
          opponentField.followers.forEach((f) => {
            if (f) targets.push(f.instanceId);
          });
          break;

        case 'none':
        default:
          break;
      }

      return targets;
    },
  }))
);
