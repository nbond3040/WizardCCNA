import type { LessonContent } from '../types';
import { slides } from './parts/ipv6-address-types-slides';
import { flashcards, quiz } from './parts/ipv6-address-types-cards';
import { exam } from './parts/ipv6-address-types-exam';

const lesson: LessonContent = {
  id: 'ipv6-address-types',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
