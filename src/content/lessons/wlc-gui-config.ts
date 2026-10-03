import type { LessonContent } from '../types';
import { slides } from './parts/wlc-gui-config-slides';
import { flashcards, quiz } from './parts/wlc-gui-config-cards';
import { exam } from './parts/wlc-gui-config-exam';

const lesson: LessonContent = {
  id: 'wlc-gui-config',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
