import type { LessonContent } from '../types';
import { slides } from './parts/tftp-ftp-slides';
import { flashcards, quiz } from './parts/tftp-ftp-cards';
import { exam } from './parts/tftp-ftp-exam';

const lesson: LessonContent = {
  id: 'tftp-ftp',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
