import type { LessonContent } from '../types';
import { slides } from './parts/cloud-concepts-slides';
import { flashcards, quiz } from './parts/cloud-concepts-cards';
import { exam } from './parts/cloud-concepts-exam';

const lesson: LessonContent = {
  id: 'cloud-concepts',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
