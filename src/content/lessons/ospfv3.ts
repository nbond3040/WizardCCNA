import type { LessonContent } from '../types';
import { slides } from './parts/ospfv3-slides';
import { flashcards, quiz } from './parts/ospfv3-cards';
import { exam } from './parts/ospfv3-exam';

const lesson: LessonContent = {
  id: 'ospfv3',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
