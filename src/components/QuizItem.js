import React, { useEffect, useState } from "react";
import Quiz from "react-quiz-component";
import Modal from "react-modal";
import {useFetchOnDemand} from "../functions/useFetchs.js"
import {QuizResult} from "./QuizResult.js"
import {fetchQuizDataResult, fetchQuizQuestions,saveResult} from "../functions/api.js";
import {formatDate, isInCurrentMonth, styleModal} from "../functions/functions.js";
import {Loading, Error} from "./Status.js";

export default function QuizItem({ userId, quizId, quizName, quizScore, quizTimestamp, triggerRefetchUserHistory, period, triggerSetUpdateQuiz }) {
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

  function getImagePath(quizId) {
    let imagePath;
    try {
      imagePath = require(`../images/${quizId}.jpg`);
    } catch {
      imagePath = require("../images/no-image.jpg"); // Remplacez par le chemin de votre image par défaut
    }
    return imagePath;
  }


  return (
    <>
      {(quizQuestionsLoading || quizDataResultLoading) && <Loading />}
      {(quizQuestionsError || quizDataResultError) && <Error message={quizQuestionsError || quizDataResultError} />}
      <div id={`quiz${quizId}`} className="quiz-item" onClick={handleQuizClick}>

        <div className="title">{quizName}</div>
        <div className="img-container">
          <img src={getImagePath(quizId)} />
        </div>
        {isInCurrentMonth(quizTimestamp) ? <QuizInfo quizTimestamp={quizTimestamp} quizScore={quizScore} /> : <div className="not-done">Not done</div>}

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
        <div className="infos">
          <div className={`score ${quizScore >= 50 ? 'green-score' : 'red-score'}`}>{quizScore}%</div>
          <div className="date">&nbsp;on {formatDate(resultDate)}</div>
        </div>)}
    </>
  );
}