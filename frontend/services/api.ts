import type { CreateQuiz, Quiz, QuizSummary } from './types';

const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, init);
  } catch {
    throw new Error(
      'Cannot connect to the API. Start the backend with `npm run start:dev` in the backend folder.',
    );
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        message = body.message;
      }
    } catch {
      // Use the HTTP status when the server returns no JSON error message.
    }
    throw new Error(message);
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}

export const api = {
  list: (signal?: AbortSignal) =>
    request<QuizSummary[]>('/quizzes', { signal }),
  get: (id: string, signal?: AbortSignal) =>
    request<Quiz>(`/quizzes/${encodeURIComponent(id)}`, { signal }),
  create: (quiz: CreateQuiz) =>
    request<Quiz>('/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz),
    }),
  remove: (id: string) =>
    request<void>(`/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}
