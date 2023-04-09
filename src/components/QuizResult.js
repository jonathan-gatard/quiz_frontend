export function QuizResult({ result }) {
    const { questions, userInput } = result;
    return (
      <div className="result-container">
        {questions.map((item, index) => {
          const userAnswer = userInput[index];
          const isUserAnswerCorrect = item.correctAnswer.includes(userAnswer);
  
          return (
            <div key={index} className="result-item">
              <h4>Question {index + 1}: {item.question}</h4>
              <ul className="answer-list">
                {item.answers.map((answer, answerIndex) => {
                  const isCorrect = item.correctAnswer.includes(answerIndex + 1);
                  const isSelected = userAnswer === (answerIndex + 1);
                  const answerClass = isSelected
                    ? (isCorrect ? 'selected-correct-answer' : 'selected-incorrect-answer')
                    : (isCorrect ? 'correct-answer' : '');
  
                  return (
                    <li key={answerIndex} className={answerClass}>
                      {item.questionType === 'photo' ? (
                        <img src={answer} alt={`Answer ${answerIndex + 1}`} />
                      ) : (
                        answer
                      )}
                      {isSelected && <span> (Your answer)</span>}
                    </li>
                  );
                })}
              </ul>
              <div className="answer-feedback">
                {isUserAnswerCorrect ? (
                  <p className="correct-answer-message">{item.messageForCorrectAnswer}</p>
                ) : (
                  <p className="incorrect-answer-message">{item.messageForIncorrectAnswer}</p>
                )}
              </div>
              <div className="answer-explanation">
                <h5>Explanation:</h5>
                <p>{item.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }