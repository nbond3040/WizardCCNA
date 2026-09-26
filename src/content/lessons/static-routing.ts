import type { LessonContent } from '../types';
import { slidesA } from './parts/static-routing-slides-a';
import { slidesB } from './parts/static-routing-slides-b';
import { flashcards, quiz } from './parts/static-routing-practice';
import { exam } from './parts/static-routing-exam';

const lesson: LessonContent = {
  id: 'static-routing',
  slides: [...slidesA, ...slidesB],
  flashcards,
  quiz,
  exam,
};

export default lesson;
