import type { LessonContent } from '../types';
import { slides } from './parts/network-components-slides';
import { flashcards, quiz, exam } from './parts/network-components-questions';

const lesson: LessonContent = {
  id: 'network-components',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
