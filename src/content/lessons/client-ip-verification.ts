import type { LessonContent } from '../types';
import { slides } from './parts/client-ip-verification-slides';
import { flashcards, quiz } from './parts/client-ip-verification-cards';
import { exam } from './parts/client-ip-verification-exam';

const lesson: LessonContent = {
  id: 'client-ip-verification',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
