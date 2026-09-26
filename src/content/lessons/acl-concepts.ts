import type { LessonContent } from '../types';
import { slides } from './parts/acl-concepts-slides';
import { flashcards, quiz, exam } from './parts/acl-concepts-questions';

const lesson: LessonContent = {
  id: 'acl-concepts',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
