import type { LessonContent } from '../types';
import slides from './parts/ios-cli-basics-slides';
import { flashcards, quiz } from './parts/ios-cli-basics-cards';
import exam from './parts/ios-cli-basics-exam';

const lesson: LessonContent = {
  id: 'ios-cli-basics',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
