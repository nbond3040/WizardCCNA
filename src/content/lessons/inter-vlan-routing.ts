import type { LessonContent } from '../types';
import slides from './parts/inter-vlan-routing-slides';
import { flashcards, quiz } from './parts/inter-vlan-routing-cards';
import exam from './parts/inter-vlan-routing-exam';

const lesson: LessonContent = {
  id: 'inter-vlan-routing',
  slides,
  flashcards,
  quiz,
  exam,
};

export default lesson;
