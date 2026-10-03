import type { LessonContent } from '../types';
import { slides } from './parts/security-program-slides';
import { flashcards, quiz } from './parts/security-program-cards';
import { exam } from './parts/security-program-exam';

const lesson: LessonContent = {
  id: 'security-program',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
