import type { LessonContent } from '../types';
import slides from './parts/ospf-network-types-slides';
import { flashcards, quiz } from './parts/ospf-network-types-cards';
import exam from './parts/ospf-network-types-exam';

const lesson: LessonContent = {
  id: 'ospf-network-types',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
