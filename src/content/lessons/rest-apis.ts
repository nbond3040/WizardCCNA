import type { LessonContent } from '../types';
import { slides } from './parts/rest-apis-slides';
import { flashcards, quiz } from './parts/rest-apis-cards';
import { exam } from './parts/rest-apis-exam';

const lesson: LessonContent = {
  id: 'rest-apis',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
