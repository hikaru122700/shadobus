import { SpellEffect, SpellContext, SpellEffectResult } from '@/types/spell.types';
import { SpellCommand, CompositeSpellCommand } from './commands/base';
import { DamageCommand } from './commands/damage';
import { HealCommand } from './commands/heal';
import { DrawCommand } from './commands/draw';
import { BuffCommand, DebuffCommand } from './commands/buff';
import { DestroyCommand } from './commands/destroy';
import { SummonCommand } from './commands/summon';

/**
 * SpellEffectからSpellCommandを生成
 */
export function createCommand(effect: SpellEffect): SpellCommand {
  switch (effect.type) {
    case 'damage':
      return new DamageCommand(effect);
    case 'heal':
      return new HealCommand(effect);
    case 'draw':
      return new DrawCommand(effect);
    case 'buff':
      return new BuffCommand(effect);
    case 'debuff':
      return new DebuffCommand(effect);
    case 'destroy':
      return new DestroyCommand(effect);
    case 'summon':
      return new SummonCommand(effect);
    default:
      throw new Error(`Unknown effect type: ${(effect as SpellEffect).type}`);
  }
}

/**
 * 複数のSpellEffectからCompositeCommandを生成
 */
export function createCompositeCommand(effects: SpellEffect[]): SpellCommand {
  const commands = effects.map(createCommand);
  return new CompositeSpellCommand(commands);
}

/**
 * スペルの全効果を実行
 */
export function executeSpellEffects(
  effects: SpellEffect[],
  context: SpellContext
): SpellEffectResult {
  const compositeCommand = createCompositeCommand(effects);

  if (!compositeCommand.canExecute(context)) {
    return { success: false, message: 'スペルを発動できません' };
  }

  return compositeCommand.execute(context);
}

/**
 * スペルが発動可能かチェック
 */
export function canCastSpell(
  effects: SpellEffect[],
  context: SpellContext
): boolean {
  const compositeCommand = createCompositeCommand(effects);
  return compositeCommand.canExecute(context);
}

// Re-export types
export { SpellCommand, CompositeSpellCommand } from './commands/base';
export { DamageCommand } from './commands/damage';
export { HealCommand } from './commands/heal';
export { DrawCommand } from './commands/draw';
export { BuffCommand, DebuffCommand } from './commands/buff';
export { DestroyCommand } from './commands/destroy';
export { SummonCommand } from './commands/summon';
