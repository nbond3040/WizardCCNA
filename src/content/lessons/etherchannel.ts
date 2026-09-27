import type { LessonContent } from '../types';
import slides from './parts/etherchannel-slides';
import { flashcards, quiz } from './parts/etherchannel-cards';
import exam from './parts/etherchannel-exam';

const lesson: LessonContent = {
  id: 'etherchannel',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
