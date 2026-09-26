import type { LessonContent } from '../types';
import { slides } from './parts/wireless-principles-slides';
import { flashcards, quiz, exam } from './parts/wireless-principles-questions';

const lesson: LessonContent = {
  id: 'wireless-principles',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
