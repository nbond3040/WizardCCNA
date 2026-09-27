import type { LessonContent } from '../types';
import { slides } from './parts/wan-technologies-slides';
import { flashcards, quiz } from './parts/wan-technologies-cards';
import { exam } from './parts/wan-technologies-exam';

const lesson: LessonContent = {
  id: 'wan-technologies',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
