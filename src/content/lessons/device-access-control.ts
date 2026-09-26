import type { LessonContent } from '../types';
import { slides } from './parts/device-access-control-slides';
import { flashcards, quiz, exam } from './parts/device-access-control-questions';

const lesson: LessonContent = {
  id: 'device-access-control',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
