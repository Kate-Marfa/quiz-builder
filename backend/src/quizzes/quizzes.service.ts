import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { CreateQuiz, Quiz, Question } from '../../models/quiz';

@Injectable()
export class QuizzesService implements OnModuleDestroy {
  private readonly db: DatabaseSync;

  constructor() {
    const path = process.env.DATABASE_PATH || './data/quizzes.sqlite';
    if (path !== ':memory:')
      mkdirSync(dirname(resolve(path)), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        questions TEXT NOT NULL,
        question_count INTEGER NOT NULL
      )
    `);
  }

  create(quiz: CreateQuiz): Quiz {
    const id = randomUUID();
    this.db
      .prepare(
        'INSERT INTO quizzes (id, title, questions, question_count) VALUES (?, ?, ?, ?)',
      )
      .run(
        id,
        quiz.title,
        JSON.stringify(quiz.questions),
        quiz.questions.length,
      );
    return { id, ...quiz };
  }

  findAll() {
    return this.db
      .prepare(
        'SELECT id, title, question_count AS questionCount FROM quizzes ORDER BY rowid DESC',
      )
      .all();
  }

  findOne(id: string): Quiz {
    const row = this.db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    if (!row) throw new NotFoundException('Quiz not found.');
    return {
      id: row.id as string,
      title: row.title as string,
      questions: JSON.parse(row.questions as string) as Question[],
    };
  }

  remove(id: string): void {
    const result = this.db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
    if (!result.changes) throw new NotFoundException('Quiz not found.');
  }

  onModuleDestroy() {
    this.db.close();
  }
}
