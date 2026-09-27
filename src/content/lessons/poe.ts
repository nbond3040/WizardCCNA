import type { LessonContent } from '../types';
import { slides } from './parts/poe-slides';
import { flashcards, quiz } from './parts/poe-cards';
import { exam } from './parts/poe-exam';

const lesson: LessonContent = {
  id: 'poe',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
