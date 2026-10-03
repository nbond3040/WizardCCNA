import type { LessonContent } from '../types';
import { slides } from './parts/wireless-security-slides';
import { flashcards, quiz } from './parts/wireless-security-cards';
import { exam } from './parts/wireless-security-exam';

const lesson: LessonContent = {
  id: 'wireless-security',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
