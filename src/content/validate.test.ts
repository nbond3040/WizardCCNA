/**
 * Content validation. Run all:            npm run validate
 * Only some lessons:                      LESSON=subnetting,vlsm npm run validate
 * Fail on missing lessons (release gate): STRICT=1 npm run validate
 */
import { describe, expect, it } from 'vitest';
import type { LessonContent } from './types';
import { LESSONS } from './curriculum';
import { validateLesson } from './validate';

const modules = import.meta.glob<{ default: LessonContent }>('./lessons/*.ts', { eager: true });
const only = (process.env.LESSON ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const entries = Object.entries(modules)
  .map(([path, mod]) => [path.replace('./lessons/', '').replace(/\.ts$/, ''), mod] as const)
  .filter(([id]) => !only.length || only.includes(id));

describe('lesson content', () => {
  for (const [id, mod] of entries) {
    it(id, () => {
      const issues = validateLesson(id, mod.default);
      if (issues.warnings.length) console.warn(`\n[${id}] ${issues.warnings.length} warning(s):\n  - ${issues.warnings.join('\n  - ')}`);
      if (issues.errors.length) console.error(`\n[${id}] ${issues.errors.length} ERROR(s):\n  - ${issues.errors.join('\n  - ')}`);
      expect(issues.errors, `errors in ${id}`).toEqual([]);
    });
  }

  it('coverage', () => {
    const have = new Set(Object.keys(modules).map((p) => p.replace('./lessons/', '').replace(/\.ts$/, '')));
    const missing = LESSONS.filter((l) => !have.has(l.id)).map((l) => l.id);
    if (missing.length) console.warn(`\n${missing.length} lesson(s) without content: ${missing.join(', ')}`);
    if (process.env.STRICT) expect(missing).toEqual([]);
  });
});
