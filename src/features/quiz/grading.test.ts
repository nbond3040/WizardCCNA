import { describe, expect, it } from 'vitest';
import type { Question } from '../../content/types';
import { optionOrder } from './grading';

const single = (id: string, explanation: string, options = ['a', 'b', 'c', 'd']): Question =>
  ({ id, type: 'single', stem: 's', options, answer: 0, explanation }) as Question;

describe('optionOrder', () => {
  it('shuffles options into a stable permutation', () => {
    const q = single('q-shuffle', 'Because of reasons.');
    const order = optionOrder(q, 7);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
    expect(optionOrder(q, 7)).toEqual(order);
  });

  it('keeps the authored order when options refer to each other', () => {
    expect(optionOrder(single('q-all', 'x', ['a', 'b', 'c', 'All of the above']), 3)).toEqual([0, 1, 2, 3]);
  });

  it('keeps the authored order when the explanation points at options by position', () => {
    for (const text of ['The second option reverses the roles.', 'Option B is wrong.', 'The last option uses a mask.', 'The first two options assume X.']) {
      expect(optionOrder(single('q-pos', text), 11)).toEqual([0, 1, 2, 3]);
    }
  });

  it('does not treat unrelated "final answer" wording as positional', () => {
    const order = optionOrder(single('q-final', 'Asks the server for the final answer.'), 5);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
  });
});
