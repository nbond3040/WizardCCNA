import type { LessonContent } from '../types';
import { slides } from './parts/json-slides';
import { flashcards, quiz } from './parts/json-cards';
import { exam } from './parts/json-exam';

const lesson: LessonContent = {
  id: 'json',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
