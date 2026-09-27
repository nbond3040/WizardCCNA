import type { LessonContent } from '../types';
import { slides } from './parts/interface-issues-slides';
import { flashcards, quiz } from './parts/interface-issues-cards';
import { exam } from './parts/interface-issues-exam';

const lesson: LessonContent = {
  id: 'interface-issues',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
