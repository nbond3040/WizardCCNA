import type { LessonContent } from '../types';
import slides from './parts/qos-slides';
import { flashcards, quiz } from './parts/qos-cards';
import exam from './parts/qos-exam';

const lesson: LessonContent = {
  id: 'qos',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
