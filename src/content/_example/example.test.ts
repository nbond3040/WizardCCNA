import { expect, it } from 'vitest';
import lesson from './example-lesson';
import { validateLesson } from '../validate';

it('reference example is valid (apart from not being in the curriculum)', () => {
  const issues = validateLesson('example', lesson);
  const errors = issues.errors.filter((e) => !e.includes('not in curriculum') && !e.includes('flashcards') && !e.includes('exam questions') && !e.includes('quiz questions'));
  if (issues.warnings.length) console.warn(issues.warnings.join('\n'));
  expect(errors).toEqual([]);
});
