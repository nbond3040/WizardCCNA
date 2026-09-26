import type { LessonContent } from '../types';
import slides from './parts/ospf-config-slides';
import { flashcards, quiz } from './parts/ospf-config-cards';
import exam from './parts/ospf-config-exam';

const lesson: LessonContent = {
  id: 'ospf-config',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
