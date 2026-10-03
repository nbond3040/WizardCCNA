import type { LessonContent } from '../types';
import { slides } from './parts/ai-ml-netops-slides';
import { flashcards, quiz } from './parts/ai-ml-netops-cards';
import { exam } from './parts/ai-ml-netops-exam';

const lesson: LessonContent = {
  id: 'ai-ml-netops',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
