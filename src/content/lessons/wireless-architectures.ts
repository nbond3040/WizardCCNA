import type { LessonContent } from '../types';
import { slides } from './parts/wireless-architectures-slides';
import { flashcards, quiz } from './parts/wireless-architectures-cards';
import { exam } from './parts/wireless-architectures-exam';

const lesson: LessonContent = {
  id: 'wireless-architectures',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
