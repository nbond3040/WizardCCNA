import type { LessonContent } from '../types';
import { slides } from './parts/subnetting-slides';
import { flashcards, quiz, exam } from './parts/subnetting-questions';

const lesson: LessonContent = {
  id: 'subnetting',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
