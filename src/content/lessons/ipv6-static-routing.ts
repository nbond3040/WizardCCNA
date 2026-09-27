import type { LessonContent } from '../types';
import { slidesA } from './parts/ipv6-static-routing-slides-a';
import { slidesB } from './parts/ipv6-static-routing-slides-b';
import { flashcards, quiz } from './parts/ipv6-static-routing-cards';
import exam from './parts/ipv6-static-routing-exam';

const lesson: LessonContent = {
  id: 'ipv6-static-routing',
  slides: [...slidesA, ...slidesB],
  flashcards,
  quiz,
  exam,
};

export default lesson;
