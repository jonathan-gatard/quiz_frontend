
import React, {useState } from "react";
import {useFetch} from "../functions/useFetchs.js"
import {fetchUserGroup, fetchUserHistory, fetchQuizDataInfos} from "../functions/api.js";
import { currentDateYYYYMM } from "../functions/functions.js"
import {Loading, Error} from "./Status.js";
import {NavBar} from "./NavBar.js"
import {QuizTable} from "./Table.js"
import QuizItem from "./QuizItem.js"

export function Training({ uid }) {
    //Called when QuizTable must be updated
    const [refetchUserHistory, setRefetchUserHistory] = useState(false);
    //Fetch UserGroup and UserHistory
    const { data: userGroup, loading: userGroupLoading, error: userGroupError } = useFetch(fetchUserGroup, [uid]);
    const { data: userHistory, loading: userHistoryLoading, error: userHistoryError } = useFetch(fetchUserHistory, [uid], refetchUserHistory);
  
    const triggerRefetchUserHistory = () => {
      console.log("triggedUpdateHistory");
      setRefetchUserHistory(prevState => !prevState);
    };
  
    return (
      <>
        {(userGroupLoading || userHistoryLoading) && <Loading />}
        {(userGroupError || userHistoryError) && <Error message={userGroupError || userHistoryError} />}
        <div>
          <div className="quiz-container">
            <NavBar uid={uid} />
            {userHistory && (<QuizTable userHistory={userHistory} />)}
            {userGroup && (
              <div className="quiz-form">
                <h1>Trainings</h1>
                <div className="quiz-sub-form">
                  {userGroup?.map((data) => (
                    <div key={data.group_id} className="group-container">
                      <Groups userId={data.user_id} groupId={data.group_id} groupName={data.group_name} triggerRefetchUserHistory={triggerRefetchUserHistory} />
                    </div>
                  ))}
                </div>
              </div>)}
          </div>
        </div>
      </>
    );
  }
  
  
  
  
  function Groups({ userId, groupId, groupName, triggerRefetchUserHistory }) {
    const [updateQuiz, setUpdateQuiz] = useState(false);
    const { data: quizDataInfos, loading: quizDataInfosLoading, error: quizDataInfosError } = useFetch(fetchQuizDataInfos, [groupId, userId], updateQuiz);
  
    const triggerSetUpdateQuiz = () => {
      console.log("triggedUpdateQuiz");
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
                  period={currentDateYYYYMM()}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }