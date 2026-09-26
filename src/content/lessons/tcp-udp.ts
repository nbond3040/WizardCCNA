import type { LessonContent } from '../types';
import { slides } from './parts/tcp-udp-slides';
import { flashcards, quiz } from './parts/tcp-udp-cards';
import { exam } from './parts/tcp-udp-exam';

const lesson: LessonContent = {
  id: 'tcp-udp',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
