import type { LessonContent } from '../types';
import { slides } from './parts/vlsm-slides';
import { flashcards, quiz, exam } from './parts/vlsm-questions';

const lesson: LessonContent = {
  id: 'vlsm',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
