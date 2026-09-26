import type { LessonContent } from '../types';
import { dhcpSlidesA } from './parts/dhcp-slides-a';
import { dhcpSlidesB } from './parts/dhcp-slides-b';
import { dhcpFlashcards, dhcpQuiz } from './parts/dhcp-cards';
import { dhcpExamA } from './parts/dhcp-exam-a';
import { dhcpExamB } from './parts/dhcp-exam-b';

const lesson: LessonContent = {
  id: 'dhcp',
  slides: [...dhcpSlidesA, ...dhcpSlidesB],
  flashcards: dhcpFlashcards,
  quiz: dhcpQuiz,
  exam: [...dhcpExamA, ...dhcpExamB],
};

export default lesson;
