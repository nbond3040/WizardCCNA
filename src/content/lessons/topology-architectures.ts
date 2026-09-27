import type { LessonContent } from '../types';
import { slides } from './parts/topology-architectures-slides';
import { flashcards, quiz } from './parts/topology-architectures-cards';
import { exam } from './parts/topology-architectures-exam';

const lesson: LessonContent = {
  id: 'topology-architectures',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
