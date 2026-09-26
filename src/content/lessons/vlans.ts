import type { LessonContent } from '../types';
import slides from './parts/vlans-slides';
import { flashcards, quiz } from './parts/vlans-cards';
import exam from './parts/vlans-exam';

const lesson: LessonContent = {
  id: 'vlans',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
