import type { LessonContent } from '../types';
import slides from './parts/fhrp-slides';
import { flashcards, quiz } from './parts/fhrp-cards';
import exam from './parts/fhrp-exam';

const lesson: LessonContent = {
  id: 'fhrp',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
