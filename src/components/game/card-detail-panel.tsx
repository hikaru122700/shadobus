'use client';

import { FollowerInstance, FollowerCardDefinition, FollowerAbility } from '@/types/card.types';

interface CardDetailPanelProps {
  definition: FollowerCardDefinition;
  instance?: FollowerInstance;
  onClose: () => void;
}

const abilityColors: Record<string, string> = {
  Rush: 'bg-orange-600',
  Storm: 'bg-purple-600',
  Ward: 'bg-blue-600',
  Bane: 'bg-green-600',
  Drain: 'bg-pink-600',
};

const abilityLabels: Record<string, string> = {
  Rush: '突進',
  Storm: '疾走',
  Ward: '守護',
  Bane: '必殺',
  Drain: 'ドレイン',
};

const abilityDescriptions: Record<string, string> = {
  Rush: 'このターン中、フォロワーに攻撃できる',
  Storm: 'このターン中、リーダーにも攻撃できる',
  Ward: '相手はまず守護持ちを攻撃しなければならない',
  Bane: 'ダメージを与えたフォロワーを破壊する',
  Drain: '攻撃時、与えたダメージ分リーダーを回復する',
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

export function CardDetailPanel({
  definition,
  instance,
  onClose,
}: CardDetailPanelProps) {
  const attack = instance?.currentAttack ?? definition.baseAttack;
  const health = instance?.currentHealth ?? definition.baseHealth;
  const maxHealth = instance?.maxHealth ?? definition.baseHealth;
  const abilities = instance?.abilities ?? definition.abilities;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      data-detail-panel
      className="absolute top-16 left-4 z-40 w-64 bg-gray-800 rounded-xl border border-gray-600 shadow-2xl p-4 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        ×
      </button>

      {/* カード名 */}
      <h2 className="text-xl font-bold text-white mb-3 pr-6">{definition.name}</h2>

      {/* 絵文字アート */}
      <div className="w-full h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center mb-3">
        <span className="text-6xl">{getCardEmoji(definition.id)}</span>
      </div>

      {/* ステータス */}
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {definition.cost}
          </div>
          <span className="text-gray-400 text-sm">コスト</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
            {attack}
          </div>
          <span className="text-gray-400 text-sm">攻撃</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
            {health}
          </div>
          <span className="text-gray-400 text-sm">
            {instance && health !== maxHealth ? `/${maxHealth}` : '体力'}
          </span>
        </div>
      </div>

      {/* アビリティ一覧 */}
      {abilities.length > 0 && (
        <div className="mb-3">
          <div className="text-gray-400 text-xs mb-1">アビリティ</div>
          <div className="space-y-2">
            {abilities.map((ability) => (
              <div key={ability} className="bg-gray-700/50 rounded-lg p-2">
                <div className={`inline-block px-2 py-0.5 rounded text-xs text-white mb-1 ${abilityColors[ability] || 'bg-gray-600'}`}>
                  {abilityLabels[ability] || ability}
                </div>
                <div className="text-gray-300 text-xs">
                  {abilityDescriptions[ability] || ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カード説明 */}
      {definition.description && (
        <div className="border-t border-gray-700 pt-2">
          <div className="text-gray-400 text-xs mb-1">説明</div>
          <div className="text-gray-300 text-sm">{definition.description}</div>
        </div>
      )}

      {/* フィールド上の状態 */}
      {instance && (
        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="text-gray-400 text-xs mb-1">状態</div>
          <div className="flex gap-2 flex-wrap">
            {instance.hasAttacked && (
              <span className="text-xs bg-gray-600 px-2 py-0.5 rounded text-gray-300">攻撃済み</span>
            )}
            {!instance.canAttack && !instance.hasAttacked && (
              <span className="text-xs bg-yellow-900 px-2 py-0.5 rounded text-yellow-300">召喚酔い</span>
            )}
            {instance.canAttack && !instance.hasAttacked && (
              <span className="text-xs bg-green-900 px-2 py-0.5 rounded text-green-300">攻撃可能</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
