//Librairies
import React, { useCallback, useEffect, useState } from "react";
import Modal from "react-modal";
import Quiz from "react-quiz-component";
import Cookies from "js-cookie";

//CSS
import "./styles.css";

//API
import { fetchQuizDataResult, fetchQuizDataInfos, fetchQuizQuestions, saveResult, fetchUserGroup, fetchUserHistory } from "./api.js";



export default function App() {
  const storedUid = Cookies.get('uid')
  const [uid, setUid] = useState(storedUid);
  const storedIsLogged = Cookies.get('isLogged')
  const [isLogged, setIsLogged] = useState(storedIsLogged);
  return (
    <>
      {!isLogged ?
        <Login setIsLogged={setIsLogged} setUid={setUid} />
        :
        <Training uid={uid} />}
    </>
  );
}


function Login({ setIsLogged, setUid }) {
  const storedUid = localStorage.getItem('userUid') || "";
  const [localUid, setLocalUid] = useState(storedUid);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (localUid.trim() !== "") {
      setUid(localUid);
      setIsLogged(true);
      Cookies.set('isLogged', true, { expires: 0.1 });
      Cookies.set('uid', localUid, { expires: 0.1 });
      localStorage.setItem('userUid', localUid);
    }
  }, [localUid]);

  return (
    <div className="login-container">
      <h1>Authentication</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="uid">UID: (use SC24461 for the moment)</label>
        <input
          type="text"
          id="uid"
          value={localUid}
          required
          onChange={(event) => setLocalUid(event.target.value)}
        />
        <button type="submit">Validate</button>
      </form>
    </div>
  );
}


function handleLogOut() {
  Cookies.remove('isLogged');
  Cookies.remove('uid');
  window.location.reload();
}

function Training({ uid }) {
  //Called when QuizTable must be updated
  const [refetchUserHistory, setRefetchUserHistory] = useState(false);
  //Fetch UserGroup and UserHistory
  const { data: userGroup, loading: userGroupLoading, error: userGroupError } = useFetch(fetchUserGroup, [uid]);
  const { data: userHistory, loading: userHistoryLoading, error: userHistoryError } = useFetch(fetchUserHistory, [uid], refetchUserHistory);

  const triggerRefetchUserHistory = () => {
    setRefetchUserHistory(prevState => !prevState);
  };

  return (
    <>
      {(userGroupLoading || userHistoryLoading) && <Loading />}
      {(userGroupError || userHistoryError) && <Error message={userGroupError || userHistoryError} />}
      <div>
        <div className="quiz-container">
          <span className="uid-info">{uid}</span>
          <span className="logout-button"><button onClick={handleLogOut}>Logout</button></span>
          {userGroup && (
            <div className="quiz-form">
              <h2>Trainings for {new Date().toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })}</h2>
              <div className="quiz-sub-form">
                {userGroup?.map((data) => (
                  <div key={data.group_id} className="group-container">
                    <Groups userId={data.user_id} groupId={data.group_id} groupName={data.group_name} triggerRefetchUserHistory={triggerRefetchUserHistory} />
                  </div>
                ))}
              </div>
            </div>)}
          {userHistory && (<QuizTable userHistory={userHistory} />)}
        </div>
      </div>
    </>
  );


}


function Groups({ userId, groupId, groupName, triggerRefetchUserHistory }) {
  const [updateQuiz, setUpdateQuiz] = useState(false);
  const { data: quizDataInfos, loading: quizDataInfosLoading, error: quizDataInfosError } = useFetch(fetchQuizDataInfos, [groupId, userId], updateQuiz);

  const triggerSetUpdateQuiz = () => {
    setUpdateQuiz(prevState => !prevState);
  };
  return (
    <>
      {(quizDataInfosLoading) && <Loading />}
      {(quizDataInfosError) && <Error message={quizDataInfosError} />}
      <h2>{groupName}</h2>
      <div className="group-sub-container">
        {quizDataInfos && quizDataInfos.map((data) => (
          <div key={data.quiz_id}>
            <div className="quiz-sub-container">
              <QuizItem
                userId={userId}
                quizId={data.quiz_id}
                quizName={data.quiz_name}
                quizScore={data.quiz_score}
                quizTimestamp={data.quiz_timestamp}
                triggerRefetchUserHistory={triggerRefetchUserHistory}
                triggerSetUpdateQuiz={triggerSetUpdateQuiz}
                period="2023/03"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}




function QuizItem({ userId, quizId, quizName, quizScore, quizTimestamp, triggerRefetchUserHistory, period, triggerSetUpdateQuiz }) {
  const [isModalResultOpen, setisModalResultOpen] = useState(false);
  const [isModalQuizOpen, setisModalQuizOpen] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [shouldFetchQuestions, setShouldFetchQuestions] = useState(false);
  const [shouldFetchResult, setShouldFetchResult] = useState(false);
  const { data: quizQuestions, loading: quizQuestionsLoading, error: quizQuestionsError } = useFetchOnDemand(fetchQuizQuestions, [quizId], shouldFetchQuestions);
  const { data: quizDataResult, loading: quizDataResultLoading, error: quizDataResultError } = useFetchOnDemand(fetchQuizDataResult, [userId, quizId, period], shouldFetchResult);

  async function handleQuizClick() {
    if (isInCurrentMonth(quizTimestamp)) {
      (!quizDataResult) ? setShouldFetchResult(true) : null
      setisModalResultOpen(true);
    } else {
      (!quizQuestions) ? setShouldFetchQuestions(true) : null
      setisModalQuizOpen(true);
    }
  }

  const handleBeforeUnload = (event) => {
    if (isModalQuizOpen) {
      event.preventDefault();
      event.returnValue = "Answers will be lost. Refresh ?";
    }
  };

  useEffect(() => {
    if (isModalQuizOpen) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isModalQuizOpen]);


  function storeResult(obj) {
    console.log("library bug")
    //Prevent library bug... 2 objects are sent, the 1st with correct/incorrect = 0
    if ((obj.numberOfIncorrectAnswers + obj.numberOfCorrectAnswers) !== 0) {
      const score = Math.round(obj.numberOfCorrectAnswers / obj.numberOfQuestions * 100)
      const result = obj
      saveResult(userId, quizId, score, result);
      setQuizFinished(true);
      triggerSetUpdateQuiz();
      triggerRefetchUserHistory();
    }
  }
  return (
    <>
      {(quizQuestionsLoading || quizDataResultLoading) && <Loading />}
      {(quizQuestionsError || quizDataResultError) && <Error message={quizQuestionsError || quizDataResultError} />}
      <div className="quiz-item" onClick={handleQuizClick}>
        <span className="quizname-text">{quizName}</span>
        {isInCurrentMonth(quizTimestamp) && <QuizInfo quizTimestamp={quizTimestamp} quizScore={quizScore} />}
      </div>

      {quizDataResult && (<Modal isOpen={isModalResultOpen} style={styleModal()} onRequestClose={() => setisModalResultOpen(false)}>
        <QuizResult result={JSON.parse(quizDataResult[0].quiz_result)} />
        <button onClick={() => setisModalResultOpen(false)}>Exit results</button>
      </Modal>)}

      {quizQuestions && (<Modal isOpen={isModalQuizOpen} style={styleModal()}>
        {quizFinished && <button onClick={() => setisModalQuizOpen(false)}>Exit quiz</button>}
        <Quiz quiz={JSON.parse(quizQuestions[0].content)} shuffle={true} onComplete={storeResult} />
      </Modal>)}
    </>
  );
}








function QuizInfo({ quizTimestamp, quizScore }) {
  const resultDate = new Date(Date.parse(quizTimestamp));
  return (
    <>
      {quizTimestamp && (
        <p>
          <span className={`score ${quizScore >= 50 ? 'green-score' : 'red-score'}`}>Result: {quizScore}%</span>
          <br />
          Done on: {formatDate(resultDate)}
        </p>)}
    </>
  );
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function isInCurrentMonth(date) {
  const currentDate = new Date();
  const checkedDate = new Date(date);
  return (
    checkedDate.getMonth() === currentDate.getMonth() &&
    checkedDate.getFullYear() === currentDate.getFullYear()
  );
}

function styleModal() {
  return {
    content: {
      width: '80%',
      height: '80%',
      margin: 'auto',
      overflow: 'auto',
    },
    overlay: {
      zIndex: 10,
    }
  };
}

function useFetch(fetchFunc, params, refetchDependency) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchFunc(...params, setData, setError);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFunc, ...params, refetchDependency]);

  return { data, loading, error };
}

function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-icon">
          <div className="spinner"></div>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};


function useFetchOnDemand(fetchFunc, params, shouldFetch) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (shouldFetch) {
        setLoading(true);
        setError(null);
        try {
          await fetchFunc(...params, setData, setError);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [fetchFunc, shouldFetch, ...params]);

  return { data, loading, error };
}


function Error({ message }) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="error-overlay">
      <div className="error-container">
        <div className="error-icon">&#10060;</div>
        <p className="error-text">Erreur : {message}</p>
        <button className="refresh-button" onClick={handleRefresh}>
          Rafraîchir
        </button>
      </div>
    </div>
  );
};

export function QuizTable({ userHistory }) {
  const storedMonthsToShow = localStorage.getItem('selectedMonthsToShow') || '6';
  const [monthsToShow, setMonthsToShow] = useState(storedMonthsToShow);
  const [tableData, setTableData] = useState({});

  function handleMonthsToShowChange(event) {
    const monthsToShow = parseInt(event.target.value, 10)
    if (monthsToShow >= 3 && monthsToShow <= 48) {
      setMonthsToShow(monthsToShow);
      localStorage.setItem('selectedMonthsToShow', monthsToShow);
    }
  }



  useEffect(() => {
    const periods = generatePeriods(monthsToShow);
    const quizzes = {};

    userHistory.forEach((item) => {
      if (!quizzes[item.quiz_name]) {
        quizzes[item.quiz_name] = {};
      }
      quizzes[item.quiz_name][item.period] = {
        done: true,
      };
    });

    setTableData({ periods, quizzes });
  }, [userHistory, monthsToShow]);



  return (
    <>
      <div className="quiz-table">
        <h2>History</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Shop</th>
                <th>Group</th>
                {tableData.periods &&
                  tableData.periods.map((period) => (
                    <th key={period}>
                      {formatDateToMMYYYY(period)}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {tableData.quizzes &&
                Object.entries(tableData.quizzes).map(([quizName, quizData]) => {
                  const firstMatchingHistory = userHistory.find(
                    (item) => item.quiz_name === quizName
                  );
                  const group = firstMatchingHistory?.group;
                  const shop = firstMatchingHistory?.shop;
                  return (
                    <tr key={quizName}>
                      <td>
                        <div>
                          {quizName}
                        </div>
                      </td>

                      <td>{group}</td>
                      <td>{shop}</td>

                      {tableData.periods.map((period) => (
                        <QuizItemCell
                          userId={firstMatchingHistory.user_id}
                          quizId={firstMatchingHistory.quiz_id}
                          quizTimestamp={firstMatchingHistory.timestamp}
                          key={period}
                          quizName={quizName}
                          period={period}
                          quizData={quizData}
                          userHistory={userHistory}
                        />
                      ))}
                    </tr>
                  );
                })}
            </tbody>

          </table>
        </div>
        <div className="months-to-show">
          <label htmlFor="months-to-show-select">Months to show: </label>
          <select
            id="months-to-show-select"
            value={monthsToShow}
            onChange={handleMonthsToShowChange}
          >
            <option value="3">3</option>
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </div>

      </div>
    </>
  );
}



export function QuizItemCell({ userId, quizId, quizName, period, quizData, userHistory, handleCellClick }) {
  const [isModalResultOpen, setisModalResultOpen] = useState(false);
  const [shouldFetchResult, setShouldFetchResult] = useState(false);
  const { data: quizDataResult, loading: quizDataResultLoading, error: quizDataResultError } = useFetchOnDemand(fetchQuizDataResult, [userId, quizId, period], shouldFetchResult);

  async function handleCellClick() {
    if (!isNaN(timestamp.getTime())) {
      if (timestamp) {
        (!quizDataResult) ? setShouldFetchResult(true) : null
        setisModalResultOpen(true);
      }
    }
  }

  const quizDone = userHistory.find(
    (item) => item.quiz_name === quizName && item.period === period
  );

  const quizzes = userHistory.find(
    (item) => item.quiz_name === quizName
  );

  const timestamp = new Date(Date.parse(quizDone?.timestamp));
  const userAdded = formatYYYYMMToDate(quizzes?.user_added);
  const quizAdded = formatYYYYMMToDate(quizzes?.quiz_added);
  const periodDate = formatYYYYMMToDate(period);
  let notDone;
  (userAdded && quizAdded) ? (notDone = periodDate >= userAdded && periodDate >= quizAdded) : (notDone = false)
  let toDo;
  const currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0).getTime()
  currentDate === periodDate.getTime() ? (toDo = true) : (toDo = false)
  const score = quizDone?.score;
  return (
    <>
      <td onClick={() => handleCellClick()}>
        {(quizDataResultLoading) && <Loading />}
        {(quizDataResultError) && <Error message={quizQuestionsError || quizDataResultError} />}
        {quizData[period]?.done ? (
          <div>
            <span className={`score ${score >= 50 ? 'green-score' : 'red-score'}`}>{score}%</span>
            <br />
            <span className="timestamp">{formatDate(timestamp)}</span>
          </div>
        ) : toDo ? (
          <div className="todo">TO DO</div>
        ) : notDone ? (
          <div className="notdone">❌</div>
        ) : null}
      </td>
      {quizDataResult && (<Modal isOpen={isModalResultOpen} style={styleModal()} onRequestClose={() => setisModalResultOpen(false)}>
        <QuizResult result={JSON.parse(quizDataResult[0].quiz_result)} />
        <button onClick={() => setisModalResultOpen(false)}>Exit results</button>
      </Modal>)}
    </>
  );
}

function generatePeriods(number_of_months) {
  const currentDate = new Date();
  const periods = [];
  for (let i = number_of_months - 1; i >= 0; i--) {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    periods.push(`${year}/${String(month).padStart(2, '0')}`);
  }
  return periods;
}



function formatDateToMMYYYY(dateString) {
  const [year, month] = dateString.split('/');
  return `${month}/${year}`;
}


function formatYYYYMMToDate(dateString) {
  if (dateString) {
    const [year, month] = dateString.split('/');
    return new Date(year, month - 1);
  }
  else {
    return null;
  }
}


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

