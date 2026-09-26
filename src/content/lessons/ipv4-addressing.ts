import type { LessonContent } from '../types';
import { slides } from './parts/ipv4-addressing-slides';
import { flashcards, quiz, exam } from './parts/ipv4-addressing-questions';

const lesson: LessonContent = {
  id: 'ipv4-addressing',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
