import type { LessonContent } from '../types';
import { slides } from './parts/wlan-physical-infrastructure-slides';
import { flashcards, quiz } from './parts/wlan-physical-infrastructure-cards';
import { exam } from './parts/wlan-physical-infrastructure-exam';

const lesson: LessonContent = {
  id: 'wlan-physical-infrastructure',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
