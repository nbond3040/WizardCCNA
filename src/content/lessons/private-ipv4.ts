import type { LessonContent } from '../types';
import { slides } from './parts/private-ipv4-slides';
import { flashcards, quiz } from './parts/private-ipv4-cards';
import { exam } from './parts/private-ipv4-exam';

const lesson: LessonContent = {
  id: 'private-ipv4',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
