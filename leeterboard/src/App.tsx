import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import type { Hacker } from "./types/types";
import { User, OAuthResponse, UserResponse } from "@supabase/supabase-js";
import { Board } from "./components/Board/Board";
import { AddUsername } from "./components/AddUsername/AddUsername";
import "./App.css";

function App() {
  const [userData, setUserData] = useState<Hacker[]>([]);
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    console.log("useEffect");
    updateAllUsers();
    // checkUser().then(() => {
    //   window.addEventListener('hashchange', () => {
    //     checkUser().then(() => {
    //       console.log('hash change');
    //     });
    //   });
    // });
  }, []);

  const checkUser = async () => {
    const userRes: UserResponse = await supabase.auth.getUser();
    console.log(userRes.data.user);
    setUser(userRes.data.user);
  };

  const signInWithGitHub = async () => {
    const { data, error }: OAuthResponse = await supabase.auth.signInWithOAuth({
      provider: "github"
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    console.log("Signed out");
  };

  const updateAllUsers = async () => {
    console.log("called update all users");

    const url = "http://localhost:5000/getUpdatedUsers";
    const res = await fetch(url);

    const updatedUserData = (await res.json()) as Hacker[];
    updatedUserData.sort((a, b) => {
      if (a.streak !== b.streak) return b.streak - a.streak;
      return a.lastSubmitted > b.lastSubmitted ? -1 : 1;
    });
    console.log("updatedUserData: ", updatedUserData);
    setUserData(updatedUserData);
  };

  return (
    <div className="App">
      <p>{user?.email || ""}</p>
      <button onClick={() => updateAllUsers()}>lole</button>
      {user ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => signInWithGitHub()}>Sign In with GitHub</button>
      )}
      <div className="container">
        <div className="boardMenu">
          <h1 className="boardName">Leeterboard</h1>
          <AddUsername />
        </div>
        <Board userData={userData} />
      </div>
    </div>
  );
}

export default App;
