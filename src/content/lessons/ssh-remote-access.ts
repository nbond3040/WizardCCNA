import type { LessonContent } from '../types';
import { slides } from './parts/ssh-remote-access-slides';
import { flashcards, quiz } from './parts/ssh-remote-access-cards';
import { exam } from './parts/ssh-remote-access-exam';

const lesson: LessonContent = {
  id: 'ssh-remote-access',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
