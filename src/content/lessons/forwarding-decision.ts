import type { LessonContent } from '../types';
import { slides } from './parts/forwarding-decision-slides';
import { flashcards, quiz } from './parts/forwarding-decision-cards';
import { exam } from './parts/forwarding-decision-exam';

const lesson: LessonContent = {
  id: 'forwarding-decision',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
