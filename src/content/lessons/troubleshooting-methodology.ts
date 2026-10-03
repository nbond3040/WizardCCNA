import type { LessonContent } from '../types';
import { slides } from './parts/troubleshooting-methodology-slides';
import { flashcards, quiz } from './parts/troubleshooting-methodology-cards';
import { exam } from './parts/troubleshooting-methodology-exam';

const lesson: LessonContent = {
  id: 'troubleshooting-methodology',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
