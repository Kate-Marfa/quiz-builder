import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../services/api';
import type { Question } from '../services/types';

type DraftQuestion = Question & { key: string };

function newQuestion(
  type: Question['type'] = 'boolean',
  text = '',
): DraftQuestion {
  const key = crypto.randomUUID();
  if (type === 'input') return { key, type, text, answer: '' };
  if (type === 'checkbox')
    return {
      key,
      type,
      text,
      options: [
        { text: '', correct: false },
        { text: '', correct: false },
      ],
    };
  return { key, type, text, answer: true };
}

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => [
    newQuestion(),
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(index: number, question: DraftQuestion) {
    setQuestions((current) =>
      current.map((item, i) => (i === index ? question : item)),
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (
      questions.some(
        (question) =>
          question.type === 'checkbox' &&
          !question.options.some((option) => option.correct),
      )
    ) {
      setError(
        'Select at least one correct option for each multiple choice question.',
      );
      return;
    }
    setSaving(true);
    try {
      const quiz = await api.create({
        title,
        questions: questions.map((question) => {
          const { key, ...data } = question;
          void key;
          return data;
        }),
      });
      navigate(`/quizzes/${quiz.id}`);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BUILD SOMETHING NEW</p>
          <h1>Create a quiz</h1>
          <p>Add your questions and choose the correct answers.</p>
        </div>
      </div>
      <form onSubmit={(event) => void submit(event)}>
        <fieldset className="form-fields" disabled={saving}>
          <section className="panel title-panel">
            <label htmlFor="quiz-title">Quiz title</label>
            <input
              id="quiz-title"
              placeholder="e.g. JavaScript fundamentals"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              pattern=".*\S.*"
            />
          </section>
          <div className="question-list">
            {questions.map((question, index) => (
              <section className="panel" key={question.key}>
                <div className="question-heading">
                  <h2>
                    <span className="question-number">{index + 1}</span>{' '}
                    Question {index + 1}
                  </h2>
                  <button
                    type="button"
                    className="text-button danger"
                    disabled={questions.length === 1}
                    onClick={() =>
                      setQuestions((current) =>
                        current.filter((item) => item.key !== question.key),
                      )
                    }
                  >
                    Remove question
                  </button>
                </div>
                <div className="question-fields">
                  <label htmlFor={`text-${question.key}`}>
                    Question
                    <input
                      id={`text-${question.key}`}
                      value={question.text}
                      placeholder="What would you like to ask?"
                      onChange={(event) =>
                        update(index, { ...question, text: event.target.value })
                      }
                      required
                      pattern=".*\S.*"
                    />
                  </label>
                  <label htmlFor={`type-${question.key}`}>
                    Question type
                    <select
                      id={`type-${question.key}`}
                      value={question.type}
                      onChange={(event) =>
                        update(index, {
                          ...newQuestion(
                            event.target.value as Question['type'],
                            question.text,
                          ),
                          key: question.key,
                        })
                      }
                    >
                      <option value="boolean">True / False</option>
                      <option value="input">Short answer</option>
                      <option value="checkbox">Multiple choice</option>
                    </select>
                  </label>
                </div>
                <fieldset className="answer-fields">
                  <legend>
                    Correct answer{question.type === 'checkbox' ? 's' : ''}
                  </legend>
                  {question.type === 'boolean' ? (
                    <div className="boolean-options">
                      {[true, false].map((answer) => (
                        <label className="choice" key={String(answer)}>
                          <input
                            type="radio"
                            name={`boolean-${question.key}`}
                            checked={question.answer === answer}
                            onChange={() =>
                              update(index, { ...question, answer })
                            }
                          />
                          {answer ? 'True' : 'False'}
                        </label>
                      ))}
                    </div>
                  ) : question.type === 'input' ? (
                    <input
                      aria-label={`Correct answer for question ${index + 1}`}
                      placeholder="Enter a short answer"
                      value={question.answer}
                      onChange={(event) =>
                        update(index, {
                          ...question,
                          answer: event.target.value,
                        })
                      }
                      required
                      pattern=".*\S.*"
                    />
                  ) : (
                    <>
                      <p className="hint">
                        Add options and check every correct answer.
                      </p>
                      {question.options.map((option, optionIndex) => (
                        <div className="option-row" key={optionIndex}>
                          <input
                            type="checkbox"
                            aria-label={`Option ${optionIndex + 1} is correct for question ${index + 1}`}
                            checked={option.correct}
                            onChange={(event) =>
                              update(index, {
                                ...question,
                                options: question.options.map((item, i) =>
                                  i === optionIndex
                                    ? { ...item, correct: event.target.checked }
                                    : item,
                                ),
                              })
                            }
                          />
                          <input
                            aria-label={`Option ${optionIndex + 1} for question ${index + 1}`}
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option.text}
                            required
                            pattern=".*\S.*"
                            onChange={(event) =>
                              update(index, {
                                ...question,
                                options: question.options.map((item, i) =>
                                  i === optionIndex
                                    ? { ...item, text: event.target.value }
                                    : item,
                                ),
                              })
                            }
                          />
                          <button
                            type="button"
                            className="icon-button danger"
                            aria-label={`Remove option ${optionIndex + 1} from question ${index + 1}`}
                            disabled={question.options.length <= 2}
                            onClick={() =>
                              update(index, {
                                ...question,
                                options: question.options.filter(
                                  (_, i) => i !== optionIndex,
                                ),
                              })
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          update(index, {
                            ...question,
                            options: [
                              ...question.options,
                              { text: '', correct: false },
                            ],
                          })
                        }
                      >
                        + Add option
                      </button>
                    </>
                  )}
                </fieldset>
              </section>
            ))}
          </div>
          <button
            type="button"
            className="button add-question"
            onClick={() =>
              setQuestions((current) => [...current, newQuestion()])
            }
          >
            + Add question
          </button>
        </fieldset>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-footer">
          <span>
            {questions.length}{' '}
            {questions.length === 1 ? 'question' : 'questions'}
          </span>
          <button className="primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Create quiz'}
          </button>
        </div>
      </form>
    </>
  );
}
