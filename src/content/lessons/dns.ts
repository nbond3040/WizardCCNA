import type { LessonContent } from '../types';
import { slides } from './parts/dns-slides';
import { flashcards, quiz } from './parts/dns-cards';
import { exam } from './parts/dns-exam';

const lesson: LessonContent = {
  id: 'dns',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
