import { BadRequestException } from '@nestjs/common';

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

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Expected an object.');
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${label} is required.`);
  }
  return value.trim();
}

export function parseQuiz(value: unknown): CreateQuiz {
  const body = object(value);
  const title = text(body.title, 'Quiz title');
  if (!Array.isArray(body.questions) || body.questions.length === 0) {
    throw new BadRequestException('Add at least one question.');
  }
  const questions = body.questions.map((value: unknown): Question => {
    const question = object(value);
    const questionText = text(question.text, 'Question text');
    switch (question.type) {
      case 'boolean':
        if (typeof question.answer !== 'boolean') {
          throw new BadRequestException(
            'Boolean answer must be true or false.',
          );
        }
        return { type: 'boolean', text: questionText, answer: question.answer };
      case 'input':
        return {
          type: 'input',
          text: questionText,
          answer: text(question.answer, 'Short answer'),
        };
      case 'checkbox': {
        if (!Array.isArray(question.options) || question.options.length < 2) {
          throw new BadRequestException('Add at least two checkbox options.');
        }
        const options = question.options.map((value: unknown) => {
          const option = object(value);
          if (typeof option.correct !== 'boolean') {
            throw new BadRequestException('Option correct must be a boolean.');
          }
          return {
            text: text(option.text, 'Option text'),
            correct: option.correct,
          };
        });
        if (!options.some((option) => option.correct)) {
          throw new BadRequestException('Select at least one correct option.');
        }
        return { type: 'checkbox', text: questionText, options };
      }
      default:
        throw new BadRequestException('Unsupported question type.');
    }
  });
  return { title, questions };
}
