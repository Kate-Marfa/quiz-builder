import type { Question } from '../services/types';

interface QuestionAnswerProps {
  question: Question;
  index: number;
}

export default function QuestionAnswer({
  question,
  index,
}: QuestionAnswerProps) {
  return (
    <fieldset disabled aria-label={`Answer for question ${index + 1}`}>
      <legend>Correct answer{question.type === 'checkbox' ? 's' : ''}</legend>
      {question.type === 'boolean' ? (
        [true, false].map((answer) => (
          <label className="choice" key={String(answer)}>
            <input
              type="radio"
              name={`answer-${index}`}
              checked={question.answer === answer}
              readOnly
            />
            {answer ? 'True' : 'False'}
          </label>
        ))
      ) : question.type === 'input' ? (
        <input aria-label="Short answer" value={question.answer} readOnly />
      ) : (
        question.options.map((option, optionIndex) => (
          <label className="choice" key={optionIndex}>
            <input type="checkbox" checked={option.correct} readOnly />
            {option.text}
          </label>
        ))
      )}
    </fieldset>
  );
}
