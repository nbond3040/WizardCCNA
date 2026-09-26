import type { LessonContent } from '../types';
import { ipv6FundamentalsSlidesA } from './parts/ipv6-fundamentals-slides-a';
import { ipv6FundamentalsSlidesB } from './parts/ipv6-fundamentals-slides-b';
import { ipv6FundamentalsFlashcards, ipv6FundamentalsQuiz } from './parts/ipv6-fundamentals-cards';
import { ipv6FundamentalsExamA } from './parts/ipv6-fundamentals-exam-a';
import { ipv6FundamentalsExamB } from './parts/ipv6-fundamentals-exam-b';

const lesson: LessonContent = {
  id: 'ipv6-fundamentals',
  slides: [...ipv6FundamentalsSlidesA, ...ipv6FundamentalsSlidesB],
  flashcards: ipv6FundamentalsFlashcards,
  quiz: ipv6FundamentalsQuiz,
  exam: [...ipv6FundamentalsExamA, ...ipv6FundamentalsExamB],
};

export default lesson;
