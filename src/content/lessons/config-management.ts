import type { LessonContent } from '../types';
import { slides } from './parts/config-management-slides';
import { flashcards, quiz } from './parts/config-management-cards';
import { exam } from './parts/config-management-exam';

const lesson: LessonContent = {
  id: 'config-management',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
