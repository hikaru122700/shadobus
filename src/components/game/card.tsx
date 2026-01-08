'use client';

import { FollowerInstance, FollowerCardDefinition } from '@/types/card.types';

interface CardProps {
  definition: FollowerCardDefinition;
  instance?: FollowerInstance;
  inHand?: boolean;
  isSelected?: boolean;
  isValidTarget?: boolean;
  canBePlayed?: boolean;
  onClick?: () => void;
  onMouseUp?: () => void;
  onMouseDown?: () => void;
  onDetailView?: () => void;
}

const abilityColors: Record<string, string> = {
  Rush: 'text-orange-400',
  Storm: 'text-purple-400',
  Ward: 'text-blue-400',
  Bane: 'text-green-400',
  Drain: 'text-pink-400',
};

const abilityLabels: Record<string, string> = {
  Rush: '突進',
  Storm: '疾走',
  Ward: '守護',
  Bane: '必殺',
  Drain: 'ドレイン',
};

const cardEmojis: Record<string, string> = {
  // ニュートラル
  goblin: '👺', 'silent-general': '🗡️', 'purgatory-demon': '👿', 'bell-angel-ria': '🔔',
  'satans-servant': '😈', 'astaroth-proclamation': '🌑', 'observer-detective': '🔍',
  'quake-goliath': '🦍', 'caravan-mammoth': '🦣', 'sin-satan': '👹', 'angel-guardian': '👼',
  'healing-angel': '💫', 'shadow-reaper': '💀', 'iron-golem': '🦾', 'flame-spirit': '🔥',
  'wind-spirit': '💨', 'earth-elemental': '🪨', 'water-elemental': '💧', 'dark-knight': '🖤',
  'light-mage': '✨', 'ancient-dragon': '🐉', 'demon-prince': '👑', 'holy-knight': '⚔️',
  'chaos-beast': '🌀', 'spirit-fox': '🦊', 'stone-warrior': '🗿', 'thunder-bird': '⚡',
  'blood-wolf': '🐺', 'golden-angel': '🌟', 'nightmare-horse': '🐴', 'crystal-golem': '💎',
  'shadow-assassin': '🗡️', phoenix: '🦅', 'ice-giant': '❄️', 'cursed-knight': '💜',
  'celestial-being': '☀️', imp: '👿', gargoyle: '🦇', minotaur: '🐂', chimera: '🦁',
  // エルフ
  fairy: '🧚', 'sonic-archer-selwyn': '🏹', 'adventure-elf-mei': '🧝‍♀️', 'gentle-treant': '🌳',
  'stray-beastman': '🐺', 'fairy-tamer': '🦋', rhinoceroach: '🦏', 'forest-defender': '🌲',
  'elf-warrior': '⚔️', 'nature-spirit': '🌿', 'wild-beast': '🐗', 'ancient-treant': '🌴',
  'fairy-queen': '👑', 'forest-ranger': '🏹', 'wolf-companion': '🐕', 'elf-princess': '👸',
  'insect-swarm': '🐜', 'wood-golem': '🪵', 'forest-nymph': '🧝', 'great-wolf': '🐺',
  'elven-archer': '🎯', 'mystic-deer': '🦌', 'thorn-warrior': '🌹', 'fairy-dragon': '🐲',
  'forest-spirit': '🌸', 'wild-elf': '🧝‍♂️', 'elder-treant': '🌳', 'swift-elf': '💨',
  'nature-fairy-aria': '🌺', 'leaf-warrior': '🍃', 'vine-guardian': '🌿', 'hawk-eye-archer': '🦅',
  'contact-fairy': '✉️', 'working-grasshopper': '🦗', 'forest-bat': '🦇',
  // ロイヤル
  'steel-knight': '🛡️', quickblader: '⚔️', 'royal-coachman': '🐴', 'trickster-rusty': '🎭',
  'battle-merchant': '💰', 'centaur-knight': '🐎', 'luminous-knight': '✨', albert: '⚡',
  knight: '🗡️', 'royal-guard': '🛡️', 'palace-fencer': '🤺', 'veteran-lancer': '🔱',
  'commander-of-armies': '🎖️', 'shield-angel': '👼', 'swift-cavalry': '🐎', 'elite-soldier': '💂',
  'royal-captain': '👨‍✈️', 'princess-knight': '👸', 'brave-warrior': '⚔️', 'castle-defender': '🏰',
  'knight-ian': '❤️', 'ninja-musasabi': '🥷', 'silver-knight-emilia': '🌟', 'royal-swordsman': '⚔️',
  'honorable-knight': '🏅', 'young-squire': '🧑', 'royal-banner': '🚩', 'dual-swordsman': '⚔️',
  'grand-marshal': '🎖️', 'fortress-knight': '🏰', 'lance-knight': '🔱', 'cavalry-commander': '🐎',
  'iron-defender': '🛡️', 'loyal-servant': '🙇', crusader: '✝️',
  // ナイトメア
  ghost: '👻', bat: '🦇', 'coco-left-paw': '🐾', 'mimi-right-paw': '🐾', 'night-demon': '😈',
  'wolf-master': '🐺', 'lesser-mummy': '🧟', 'succubus-lilim': '💋', 'lovers-necromancer': '💀',
  cerberus: '🐕', 'mino-death-reaper': '💀', skeleton: '💀', 'dark-vampire': '🧛',
  'cursed-zombie': '🧟', 'phantom-knight': '👤', 'soul-eater': '👁️', 'death-knight': '⚰️',
  'blood-sucker': '🩸', 'nightmare-beast': '👾', 'shadow-spirit': '👥', 'demon-familiar': '😈',
  'necromancer-lord': '💀', 'bone-dragon': '🦴', 'poison-medusa': '🐍', 'evil-contract-demon': '📜',
  'juggling-ghost': '🎪', 'dark-general': '⚔️', wraith: '👻', lich: '💀', 'hell-hound': '🐕‍🦺',
  banshee: '😱', 'grave-robber': '⛏️', 'undead-king': '👑', 'cursed-spirit': '💜', 'blood-demon': '🩸',
  // ビショップ
  'holy-flame-tiger': '🐯', 'holy-falcon': '🦅', 'majestic-hawk': '🦅', 'wing-warrior': '👼',
  'pure-white-fox': '🦊', 'healing-sister': '⛪', jeanne: '⚜️', 'sacred-griffon': '🦁',
  'iron-fist-priest': '👊', 'holy-priest': '🙏', 'divine-shield': '🛡️', 'temple-guard': '⛩️',
  'angelic-knight': '👼', 'holy-lion': '🦁', 'prism-priest': '💎', skullphane: '💀',
  'earth-guardian-meeve': '🌍', 'divine-angel': '😇', 'sacred-beast': '🦄', 'light-spirit': '💡',
  'prayer-maiden': '🙏', 'holy-dragon': '🐉', purifier: '✨', 'holy-knight-bishop': '⚔️',
  'sacred-guardian': '🛡️', monk: '🧘', 'holy-serpent': '🐍', 'blessed-unicorn': '🦄',
  'divine-protector': '🌟', 'holy-maiden': '👸', 'celestial-knight': '⚔️', 'temple-lion': '🦁',
  'holy-enchanter': '✨', 'divine-eagle': '🦅', 'sacred-dove': '🕊️',
  // ドラゴン
  'silver-dragon': '🐲', 'gold-dragon': '🐉', 'princess-guard': '👸', 'baby-fire-drake': '🔥',
  'great-wing-dragon': '🦖', 'shark-soldier': '🦈', 'fire-lizard': '🦎', 'genesis-dragon-reborn': '🌟',
  'roaring-dragon-rider': '🐲', 'fierce-dragon-warrior': '⚔️', 'dragon-slayer-axe': '🪓',
  'wind-rider-eifa': '💨', 'dragon-knight-kit': '🐉', 'cloud-dragon-rider': '☁️', 'fire-dragon': '🔥',
  'ice-dragon': '❄️', 'thunder-dragon': '⚡', 'dragon-rider': '🐲', 'earth-dragon': '🌍',
  'dragon-whelp': '🐣', 'storm-dragon': '🌩️', 'guardian-dragon': '🛡️', 'dragon-master': '👑',
  'twin-dragon': '🐲', 'sea-dragon': '🌊', 'sky-dragon': '☁️', 'flame-breath-dragon': '🔥',
  'ancient-wyrm': '🐉', 'dragon-egg': '🥚', 'volcanic-dragon': '🌋', 'crystal-dragon': '💎',
  'shadow-dragon': '🖤', 'dragon-knight': '⚔️', drake: '🐲', 'dragon-lord': '👑',
  // ウィッチ
  'anne-great-spirit': '👻', 'shikigami-noble': '📿', 'shikigami-empress': '👘',
  'guardian-golem': '🗿', 'clay-golem': '🧱', 'flash-swordsman': '⚡', 'shikigami-avatar': '👤',
  'shikigami-fierce': '👹', 'owl-summoner': '🦉', 'wonder-witch-emil': '🧙‍♀️', 'blaze-destroyer': '🔥',
  'witch-remirami': '🎭', 'magic-owl': '🦉', 'arcane-mage': '🔮', 'elemental-mage': '🌈',
  'frost-witch': '❄️', 'fire-mage': '🔥', 'storm-mage': '🌩️', 'golem-master': '🗿',
  summoner: '🌀', 'time-mage': '⏰', 'dimension-witch': '🌌', 'apprentice-mage': '📚',
  'witch-apprentice': '🧹', 'spell-golem': '🗿', 'dark-witch': '🖤', 'grand-summoner': '✨',
  'rune-mage': '🔣', 'crystal-mage': '💎', 'chaos-witch': '🌀', 'mystic-golem': '🔮',
  'lightning-mage': '⚡', 'void-witch': '🌑', 'spell-knight': '⚔️', 'magic-golem': '✨',
  // ネメシス
  lloyd: '🤖', 'improved-puppet': '🎎', 'castle-artifact': '🏰', 'attack-artifact': '⚔️',
  'destroy-artifact-alpha': '🔧', 'destroy-artifact-beta': '🔧', 'destroy-artifact-gamma': '🔧',
  'exceed-artifact-omega': '💎', 'marionette-lancer': '🎭', 'automata-assassin': '🗡️',
  'steel-cavalry': '🛡️', noah: '🧵', orchis: '🎀', liam: '🔬', puppet: '🎎',
  'silvia-judge': '⚖️', 'sinfonia-heart-zwei': '💙', 'cat-beastman-artillery': '🐱',
  'beast-steel-man': '🦾', 'electro-whipper': '⚡', 'artifact-scout': '🔎', 'artifact-guardian': '🛡️',
  'artifact-knight': '⚔️', 'puppet-master': '🎭', 'mechanical-beast': '🦾', 'android-soldier': '🤖',
  'robotic-guardian': '🛡️', 'cyber-knight': '⚔️', 'tech-golem': '🗿', 'fusion-artifact': '🔗',
  'puppet-knight': '⚔️', 'artifact-dragon': '🐉', 'mechanical-angel': '😇', 'combat-droid': '🤖',
  'defense-unit': '🛡️', 'assault-droid': '💥', 'prototype-alpha': '🔬', 'prototype-beta': '🔬',
  'prototype-omega': '💎', 'doll-dancer': '💃', 'iron-puppet': '🎎', 'string-master': '🧵',
  'gear-beast': '⚙️', 'clockwork-soldier': '⏰', 'steam-golem': '💨', 'brass-knight': '🥉',
  'core-artifact': '💠', 'prime-artifact': '✨', 'ultra-artifact': '⭐', 'toy-soldier': '🪖',
};

function getCardEmoji(id: string): string {
  return cardEmojis[id] || '❓';
}

export function Card({
  definition,
  instance,
  inHand = false,
  isSelected = false,
  isValidTarget = false,
  canBePlayed = true,
  onClick,
  onMouseUp,
  onMouseDown,
  onDetailView,
}: CardProps) {
  const attack = instance?.currentAttack ?? definition.baseAttack;
  const health = instance?.currentHealth ?? definition.baseHealth;
  const abilities = instance?.abilities ?? definition.abilities;

  const getBorderColor = () => {
    if (isSelected) return 'border-yellow-400 shadow-yellow-400/50';
    if (isValidTarget) return 'border-red-500 shadow-red-500/50 animate-pulse';
    return 'border-gray-600';
  };

  const getOpacity = () => {
    if (!canBePlayed && inHand) return 'opacity-50';
    if (instance && instance.hasAttacked) return 'opacity-70';
    return '';
  };

  const showSummoningSickness =
    instance && !instance.canAttack && !instance.hasAttacked;

  return (
    <div
      data-follower-id={instance?.instanceId}
      className={`
        relative w-24 h-36 rounded-lg border-2 ${getBorderColor()} ${getOpacity()}
        bg-gradient-to-b from-gray-700 to-gray-900
        cursor-pointer hover:scale-105 transition-all duration-200
        flex flex-col shadow-lg select-none
        ${isSelected ? 'shadow-lg scale-105 z-10' : ''}
        ${isValidTarget ? 'shadow-lg shadow-red-500/50' : ''}
      `}
      onClick={() => {
        onDetailView?.();
        onClick?.();
      }}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
    >
      {/* コスト */}
      <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-blue-600 border-2 border-blue-400
                      flex items-center justify-center text-white font-bold text-sm z-10">
        {definition.cost}
      </div>

      {/* カード名 */}
      <div className="text-center text-xs text-white mt-5 px-1 truncate font-medium">
        {definition.name}
      </div>

      {/* カードアート（プレースホルダー） */}
      <div className="flex-1 mx-2 my-1 bg-gradient-to-br from-gray-500 to-gray-700 rounded flex items-center justify-center">
        <span className="text-3xl opacity-70">
          {getCardEmoji(definition.id)}
        </span>
      </div>

      {/* 能力 */}
      {abilities.length > 0 && (
        <div className="text-center text-[10px] px-1 space-x-1">
          {abilities.map((ability) => (
            <span key={ability} className={abilityColors[ability] || 'text-gray-400'}>
              {abilityLabels[ability] || ability}
            </span>
          ))}
        </div>
      )}

      {/* ステータス */}
      <div className="flex justify-between px-2 pb-1 mt-1">
        <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold text-sm">
          {attack}
        </div>
        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
          {health}
        </div>
      </div>

      {/* 召喚酔い表示 */}
      {showSummoningSickness && (
        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
          <span className="text-[10px] text-gray-300 bg-black/60 px-2 py-1 rounded">
            召喚酔い
          </span>
        </div>
      )}

      {/* 攻撃済み表示 */}
      {instance?.hasAttacked && (
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
          <span className="text-[10px] text-gray-400 bg-black/60 px-2 py-1 rounded">
            攻撃済み
          </span>
        </div>
      )}

      {/* 攻撃対象インジケーター */}
      {isValidTarget && (
        <div className="absolute -inset-1 border-2 border-red-400 rounded-xl animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
