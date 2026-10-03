import type { LessonContent } from '../types';
import { slidesA } from './parts/security-concepts-slides';
import { slidesB } from './parts/security-concepts-slides2';
import { flashcards, quiz } from './parts/security-concepts-cards';
import { exam } from './parts/security-concepts-exam';

const lesson: LessonContent = {
  id: 'security-concepts',
  slides: [...slidesA, ...slidesB],
  flashcards,
  quiz,
  exam,
};

export default lesson;
