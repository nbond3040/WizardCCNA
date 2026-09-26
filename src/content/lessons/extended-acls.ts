import type { LessonContent } from '../types';
import { slides } from './parts/extended-acls-slides';
import { flashcards, quiz } from './parts/extended-acls-cards';
import { exam } from './parts/extended-acls-exam';

const lesson: LessonContent = {
  id: 'extended-acls',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
