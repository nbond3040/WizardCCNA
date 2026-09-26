import type { LessonContent } from '../types';
import { slides } from './parts/routing-table-slides';
import { flashcards, quiz } from './parts/routing-table-cards';
import { exam } from './parts/routing-table-exam';

const lesson: LessonContent = {
  id: 'routing-table',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
