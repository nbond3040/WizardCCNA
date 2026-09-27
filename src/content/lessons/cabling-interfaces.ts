import type { LessonContent } from '../types';
import { slides } from './parts/cabling-interfaces-slides';
import { flashcards, quiz } from './parts/cabling-interfaces-cards';
import { exam } from './parts/cabling-interfaces-exam';

const lesson: LessonContent = {
  id: 'cabling-interfaces',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
