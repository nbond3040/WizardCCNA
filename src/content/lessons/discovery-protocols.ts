import type { LessonContent } from '../types';
import { slides } from './parts/discovery-protocols-slides';
import { flashcards, quiz } from './parts/discovery-protocols-cards';
import { exam } from './parts/discovery-protocols-exam';

const lesson: LessonContent = {
  id: 'discovery-protocols',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
