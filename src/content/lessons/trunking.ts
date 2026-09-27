import type { LessonContent } from '../types';
import slides from './parts/trunking-slides';
import { flashcards, quiz } from './parts/trunking-cards';
import exam from './parts/trunking-exam';

const lesson: LessonContent = {
  id: 'trunking',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
