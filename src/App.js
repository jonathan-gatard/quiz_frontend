//Librairies
import React, {useState } from "react";
import Cookies from "js-cookie";

//CSS
import "./styles.css";

//Components
import {Login} from "./components/Login.js"
import {Training} from "./components/Training.js"


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