import type { LessonContent } from '../types';
import { slides } from './parts/syslog-slides';
import { flashcards, quiz } from './parts/syslog-cards';
import { exam } from './parts/syslog-exam';

const lesson: LessonContent = {
  id: 'syslog',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
