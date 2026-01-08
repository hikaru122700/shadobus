'use client';

import Link from 'next/link';
import { getAllCards } from '@/data/sample-cards';
import { FollowerCardDefinition, CardDefinition } from '@/types/card.types';

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

function CardDetail({ card }: { card: FollowerCardDefinition }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-colors">
      <div className="flex gap-6">
        {/* カードプレビュー */}
        <div className="w-32 h-44 rounded-lg border-2 border-gray-600 bg-gradient-to-b from-gray-700 to-gray-900 flex flex-col relative shrink-0">
          {/* コスト */}
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white font-bold">
            {card.cost}
          </div>

          {/* カード名 */}
          <div className="text-center text-sm text-white mt-6 px-2 truncate font-medium">
            {card.name}
          </div>

          {/* カードアート */}
          <div className="flex-1 mx-3 my-2 bg-gradient-to-br from-gray-500 to-gray-700 rounded flex items-center justify-center">
            <span className="text-4xl">{cardEmojis[card.id] || '❓'}</span>
          </div>

          {/* ステータス */}
          <div className="flex justify-between px-3 pb-2">
            <div className="w-7 h-7 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
              {card.baseAttack}
            </div>
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
              {card.baseHealth}
            </div>
          </div>
        </div>

        {/* カード情報 */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-2">{card.name}</h2>

          {/* ステータス */}
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-blue-400 text-sm">コスト:</span>
              <span className="text-white font-bold">{card.cost}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-sm">攻撃力:</span>
              <span className="text-white font-bold">{card.baseAttack}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400 text-sm">体力:</span>
              <span className="text-white font-bold">{card.baseHealth}</span>
            </div>
          </div>

          {/* 能力 */}
          {card.abilities.length > 0 && (
            <div className="flex gap-2 mb-3">
              {card.abilities.map((ability) => (
                <span
                  key={ability}
                  className={`px-2 py-1 rounded text-sm text-white ${abilityColors[ability] || 'bg-gray-600'}`}
                >
                  {abilityLabels[ability] || ability}
                </span>
              ))}
            </div>
          )}

          {/* 説明 */}
          <p className="text-gray-400 text-sm">{card.description}</p>

          {/* 能力の詳細説明 */}
          {card.abilities.length > 0 && (
            <div className="mt-3 p-3 bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">能力詳細</div>
              {card.abilities.map((ability) => (
                <div key={ability} className="text-sm text-gray-300">
                  <span className={`${abilityColors[ability]?.replace('bg-', 'text-')} font-medium`}>
                    {abilityLabels[ability]}
                  </span>
                  {': '}
                  {ability === 'Rush' && '場に出たターンでもフォロワーを攻撃できる'}
                  {ability === 'Storm' && '場に出たターンでも攻撃できる（リーダーも含む）'}
                  {ability === 'Ward' && '守護持ちがいる限り、他のフォロワーやリーダーは攻撃されない'}
                  {ability === 'Bane' && 'このフォロワーがダメージを与えたフォロワーを破壊する'}
                  {ability === 'Drain' && '攻撃時にリーダーの体力を回復する'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const allCards = getAllCards();

  // フォロワーカードのみをフィルタリング
  const cards = allCards.filter((c): c is FollowerCardDefinition => c.type === 'follower');

  // コスト順にソート
  const sortedCards = [...cards].sort((a, b) => a.cost - b.cost);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <header className="bg-gray-800 p-4 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Shadobus
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-lg">カードプール</h1>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            ゲームに戻る
          </Link>
        </div>
      </header>

      {/* 統計情報 */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{cards.length}</div>
            <div className="text-gray-400 text-sm">総カード数</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {cards.filter((c) => c.abilities.includes('Storm')).length}
            </div>
            <div className="text-gray-400 text-sm">疾走カード</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {cards.filter((c) => c.abilities.includes('Ward')).length}
            </div>
            <div className="text-gray-400 text-sm">守護カード</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {cards.filter((c) => c.abilities.includes('Bane')).length}
            </div>
            <div className="text-gray-400 text-sm">必殺カード</div>
          </div>
        </div>

        {/* カードリスト */}
        <h2 className="text-xl font-bold mb-4">全カード一覧（コスト順）</h2>
        <div className="grid gap-4">
          {sortedCards.map((card) => (
            <CardDetail key={card.id} card={card} />
          ))}
        </div>

        {/* 能力解説 */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">能力解説</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-600 rounded text-sm">疾走</span>
                <span className="text-white font-medium">Storm</span>
              </div>
              <p className="text-gray-400 text-sm">
                場に出たターンでも攻撃できる最強の能力。リーダーへの直接攻撃も可能。
              </p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-orange-600 rounded text-sm">突進</span>
                <span className="text-white font-medium">Rush</span>
              </div>
              <p className="text-gray-400 text-sm">
                場に出たターンでもフォロワーを攻撃できる。リーダーは攻撃不可。
              </p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-600 rounded text-sm">守護</span>
                <span className="text-white font-medium">Ward</span>
              </div>
              <p className="text-gray-400 text-sm">
                守護持ちが場にいる限り、他のフォロワーやリーダーは攻撃対象に選べない。
              </p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-600 rounded text-sm">必殺</span>
                <span className="text-white font-medium">Bane</span>
              </div>
              <p className="text-gray-400 text-sm">
                このフォロワーがダメージを与えたフォロワーは、体力に関係なく破壊される。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
