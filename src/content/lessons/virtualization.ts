import type { LessonContent } from '../types';
import { slides } from './parts/virtualization-slides';
import { flashcards, quiz } from './parts/virtualization-cards';
import { exam } from './parts/virtualization-exam';

const lesson: LessonContent = {
  id: 'virtualization',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
