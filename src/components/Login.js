import React, { useCallback, useState } from "react";
import Cookies from "js-cookie";

export function Login({ setIsLogged, setUid }) {
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