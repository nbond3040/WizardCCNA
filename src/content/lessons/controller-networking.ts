import type { LessonContent } from '../types';
import { slides } from './parts/controller-networking-slides';
import { flashcards, quiz } from './parts/controller-networking-cards';
import { exam } from './parts/controller-networking-exam';

const lesson: LessonContent = {
  id: 'controller-networking',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
