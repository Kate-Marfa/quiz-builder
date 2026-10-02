import { Test } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { QuizzesService } from '../src/quizzes/quizzes.service';
import { parseQuiz } from '../models/quiz';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Quiz } from '../models/quiz';

const sample = {
  title: 'Web basics',
  questions: [
    { type: 'boolean', text: 'HTML is a markup language.', answer: true },
    { type: 'input', text: 'What styles a web page?', answer: 'CSS' },
    {
      type: 'checkbox',
      text: 'Select web languages.',
      options: [
        { text: 'HTML', correct: true },
        { text: 'CSS', correct: true },
        { text: 'Photoshop', correct: false },
      ],
    },
  ],
};

describe('Quizzes API', () => {
  let app: INestApplication<App>;
  const server = () => app.getHttpAdapter().getInstance() as App;
  beforeAll(async () => {
    process.env.DATABASE_PATH = ':memory:';
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  it('creates, lists, reads and deletes a quiz with all question types', async () => {
    const response = await request(server())
      .post('/quizzes')
      .send(sample)
      .expect(201);
    const quiz = response.body as Quiz;
    expect(quiz).toEqual({ id: expect.any(String) as string, ...sample });
    await request(server())
      .get('/quizzes')
      .expect(200)
      .expect([{ id: quiz.id, title: sample.title, questionCount: 3 }]);
    await request(server()).get(`/quizzes/${quiz.id}`).expect(200).expect(quiz);
    await request(server()).delete(`/quizzes/${quiz.id}`).expect(204);
    await request(server()).get('/quizzes').expect(200).expect([]);
    await request(server()).get(`/quizzes/${quiz.id}`).expect(404);
    await request(server()).delete(`/quizzes/${quiz.id}`).expect(404);
  });

  it.each([
    {},
    { title: ' ', questions: sample.questions },
    { title: 'Quiz', questions: [] },
    { title: 'Quiz', questions: [null] },
    { title: 'Quiz', questions: [{ type: 'other', text: 'Question' }] },
    {
      title: 'Quiz',
      questions: [{ type: 'boolean', text: 'Question', answer: 'true' }],
    },
    {
      title: 'Quiz',
      questions: [{ type: 'input', text: 'Question', answer: ' ' }],
    },
    {
      title: 'Quiz',
      questions: [
        {
          type: 'checkbox',
          text: 'Question',
          options: [{ text: 'A', correct: true }],
        },
      ],
    },
    {
      title: 'Quiz',
      questions: [
        {
          type: 'checkbox',
          text: 'Question',
          options: [
            { text: 'A', correct: false },
            { text: 'B', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Quiz',
      questions: [
        {
          type: 'checkbox',
          text: 'Question',
          options: [
            { text: ' ', correct: true },
            { text: 'B', correct: false },
          ],
        },
      ],
    },
  ])('rejects invalid payload %#', async (body) => {
    await request(server()).post('/quizzes').send(body).expect(400);
  });

  it('trims title, question and answer whitespace', async () => {
    const response = await request(server())
      .post('/quizzes')
      .send({
        title: ' Quiz ',
        questions: [{ type: 'input', text: ' Question ', answer: ' Answer ' }],
      })
      .expect(201);
    expect((response.body as Quiz).title).toBe('Quiz');
    expect((response.body as Quiz).questions).toEqual([
      { type: 'input', text: 'Question', answer: 'Answer' },
    ]);
  });
});

describe('SQLite persistence', () => {
  it('keeps quizzes after reopening the database and persists deletion', () => {
    const directory = mkdtempSync(join(tmpdir(), 'quiz-builder-'));
    const previousPath = process.env.DATABASE_PATH;
    process.env.DATABASE_PATH = join(directory, 'quizzes.sqlite');
    let service: QuizzesService | undefined;
    try {
      service = new QuizzesService();
      const quiz = service.create(parseQuiz(sample));
      service.onModuleDestroy();
      service = new QuizzesService();
      expect(service.findOne(quiz.id)).toEqual(quiz);
      service.remove(quiz.id);
      service.onModuleDestroy();
      service = new QuizzesService();
      expect(service.findAll()).toEqual([]);
    } finally {
      service?.onModuleDestroy();
      if (previousPath === undefined) delete process.env.DATABASE_PATH;
      else process.env.DATABASE_PATH = previousPath;
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
