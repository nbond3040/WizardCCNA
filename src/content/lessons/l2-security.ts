import type { LessonContent } from '../types';
import { slides } from './parts/l2-security-slides';
import { flashcards, quiz } from './parts/l2-security-cards';
import { exam } from './parts/l2-security-exam';

const lesson: LessonContent = {
  id: 'l2-security',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
