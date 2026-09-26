import type { LessonContent } from '../types';
import { slidesA } from './parts/ethernet-switching-slides-a';
import { slidesB } from './parts/ethernet-switching-slides-b';
import { flashcards, quiz } from './parts/ethernet-switching-cards';
import { examA } from './parts/ethernet-switching-exam-a';
import { examB } from './parts/ethernet-switching-exam-b';

const lesson: LessonContent = {
  id: 'ethernet-switching',
  slides: [...slidesA, ...slidesB],
  flashcards,
  quiz,
  exam: [...examA, ...examB],
};

export default lesson;
