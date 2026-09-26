import type { LessonContent } from '../types';
import { natSlidesA } from './parts/nat-slides-a';
import { natSlidesB } from './parts/nat-slides-b';
import { natFlashcards, natQuiz } from './parts/nat-cards';
import { natExamA } from './parts/nat-exam-a';
import { natExamB } from './parts/nat-exam-b';

const lesson: LessonContent = {
  id: 'nat',
  slides: [...natSlidesA, ...natSlidesB],
  flashcards: natFlashcards,
  quiz: natQuiz,
  exam: [...natExamA, ...natExamB],
};

export default lesson;
