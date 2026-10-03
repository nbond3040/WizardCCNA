import type { LessonContent } from '../types';
import slides from './parts/device-management-access-slides';
import { flashcards, quiz } from './parts/device-management-access-cards';
import exam from './parts/device-management-access-exam';

const lesson: LessonContent = {
  id: 'device-management-access',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
