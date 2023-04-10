const API_URL = "https://quiz.neptune79.duckdns.org/api";
//const API_URL = "http://localhost:4000/api";

// Fetch user group
export async function fetchUserGroup(uid, setUserGroup, setError) {
  try {
    const response = await fetch(`${API_URL}/user-group/${uid}`);
    if (response.ok) {
      const data = await response.json();
      setUserGroup(data);
    } else {
      setError("Error during user group fetch");
    }
  } catch (error) {
    setError(error.message);
  }
}


// Fetch user history
export async function fetchUserHistory(uid, setUserHistory, setError) {
  try {
    const response = await fetch(`${API_URL}/history/${uid}/`);
    if (response.ok) {
      const data = await response.json();
      setUserHistory(data);
    } else {
      setError("Error during user history fetch.");
    }
  } catch (error) {
    setError(error.message);
  }
}


// Fetch quiz infos
export async function fetchQuizDataInfos(groupId, userId, setQuizDataInfos, setError) {
  try {
    const response = await fetch(`${API_URL}/quiz-infos/${groupId}/${userId}`);
    if (response.status === 200) {
      const quizData = await response.json();
      setQuizDataInfos(quizData);
    } else {
      setError("Error during quiz info fetch.");
    }
  } catch (error) {
    setError(error.message);
  }
}




// Fetch quiz data
export async function fetchQuizDataResult(userId, quizId, period, setQuizDataResult, setError) {
  try {
    const periodEncoded = encodeURIComponent(period);
    const response = await fetch(`${API_URL}/quiz-data/${userId}/${quizId}/${periodEncoded}`);
    if (response.status === 200) {
      const quizData = await response.json();
      setQuizDataResult(quizData);
    } else {
      setError("Error during quiz questions fetch.");
    }
  } catch (error) {
    setError(error.message);
  }
}


// Fetch quiz questions
export async function fetchQuizQuestions(quizId, setQuizQuestions, setError) {
  try {
    const response = await fetch(`${API_URL}/quiz-questions/${quizId}`);
    if (response.status === 200) {
      const quizQuestions = await response.json();
      setQuizQuestions(quizQuestions);
    } else {
      setError("Error during quiz questions fetch.");
    }
  } catch (error) {
    setError(error.message);
  }
}


//Save results of Quiz
export async function saveResult(userId, quizId, score, result) {
  try {
    const response = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        result: result,
      }),
    });
  } catch (error) {
    console.error(error);
  }
}