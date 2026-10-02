export type Question =
  | { type: 'boolean'; text: string; answer: boolean }
  | { type: 'input'; text: string; answer: string }
  | {
      type: 'checkbox';
      text: string;
      options: { text: string; correct: boolean }[];
    };

export interface CreateQuiz {
  title: string;
  questions: Question[];
}

export interface Quiz extends CreateQuiz {
  id: string;
}

export interface QuizSummary {
  id: string;
  title: string;
  questionCount: number;
}
