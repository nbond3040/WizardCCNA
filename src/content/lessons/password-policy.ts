import type { LessonContent } from '../types';
import { slides } from './parts/password-policy-slides';
import { flashcards, quiz } from './parts/password-policy-cards';
import { exam } from './parts/password-policy-exam';

const lesson: LessonContent = {
  id: 'password-policy',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
