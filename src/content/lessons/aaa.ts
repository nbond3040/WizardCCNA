import type { LessonContent } from '../types';
import slides from './parts/aaa-slides';
import { flashcards, quiz } from './parts/aaa-cards';
import exam from './parts/aaa-exam';

const lesson: LessonContent = {
  id: 'aaa',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
