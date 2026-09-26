import type { LessonContent } from '../types';
import slides from './parts/ospf-concepts-slides';
import { flashcards, quiz } from './parts/ospf-concepts-cards';
import exam from './parts/ospf-concepts-exam';

const lesson: LessonContent = {
  id: 'ospf-concepts',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
