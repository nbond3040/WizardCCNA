import type { LessonContent } from '../types';
import { slides } from './parts/network-models-slides';
import { flashcards, quiz, exam } from './parts/network-models-questions';

const lesson: LessonContent = {
  id: 'network-models',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
