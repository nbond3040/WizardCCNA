import type { LessonContent } from '../types';
import slides from './parts/vpns-slides';
import { flashcards, quiz } from './parts/vpns-cards';
import exam from './parts/vpns-exam';

const lesson: LessonContent = {
  id: 'vpns',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
