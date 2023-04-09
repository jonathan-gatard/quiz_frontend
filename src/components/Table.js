
import React, {useState, useEffect} from "react";
import {generatePeriods, formatDateToMMYYYY, formatYYYYMMToDate, formatDate, styleModal} from "../functions/functions.js";
import {useFetchOnDemand} from "../functions/useFetchs.js"
import {fetchQuizDataResult} from "../functions/api.js";
import {Loading, Error} from "./Status.js";
import {QuizResult} from "./QuizResult.js";
import Modal from "react-modal";

export function QuizTable({ userHistory }) {
    const storedMonthsToShow = localStorage.getItem('selectedMonthsToShow') || '6';
    const [monthsToShow, setMonthsToShow] = useState(storedMonthsToShow);
    const [tableData, setTableData] = useState({});
    const [statsHidden, setStatsHidden] = useState(false);
  
    function handleMonthsToShowChange(event) {
      const monthsToShow = parseInt(event.target.value, 10)
      if (monthsToShow >= 3 && monthsToShow <= 24) {
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
  
    function handleHideStats() {
      setStatsHidden((prevState => !prevState));
    }
  
    return (
      <>
        <div className="quiz-table">
          <h1>
            Statistics
            &nbsp;
            <button className="button-stats" onClick={handleHideStats}>{statsHidden ? "Show" : "Hide"}</button>
          </h1>
          {!statsHidden &&
            <>
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
            </>}
  
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
      else if (periodDate.getTime() == currentDate)
      {
        const element = document.getElementById("quiz" + quizId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.classList.add('blink');
          setTimeout(() => {
            element.classList.remove('blink');
          }, 1500);
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
            <div className="notdone">NOT DONE</div>
          ) : null}
        </td>
        {quizDataResult && (<Modal isOpen={isModalResultOpen} style={styleModal()} onRequestClose={() => setisModalResultOpen(false)}>
          <QuizResult result={JSON.parse(quizDataResult[0].quiz_result)} />
          <button onClick={() => setisModalResultOpen(false)}>Exit results</button>
        </Modal>)}
      </>
    );
  }