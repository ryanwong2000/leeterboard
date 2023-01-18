import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { RecentSubmission, LCUser } from '../types/types';
import UserCard from './components/UserCard';
import { OAuthResponse, UserResponse } from '@supabase/supabase-js';

function App() {
  const [userData, setUserData] = useState<LCUser[]>([]);
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    console.log('useEffect');
    setUserData([]);
    checkUser().then(() => {
      window.addEventListener('hashchange', () => {
        checkUser().then(() => {
          console.log('hash change');
        });
      });
    });
  }, []);

  const checkUser = async () => {
    const userRes: UserResponse = await supabase.auth.getUser();
    console.log(userRes.data.user);
    setUser(userRes.data.user);
    // const tempUser = userRes.data.user as SupabaseUser | null;
    // if (tempUser) {
    //   setUser(tempUser);
    // }
  };

  const signInWithGitHub = async () => {
    const { data, error }: OAuthResponse = await supabase.auth.signInWithOAuth({
      provider: 'github'
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
  };

  const updateAllUsers = async () => {
    console.log('called update all users');

    const url = 'http://localhost:5000/getUpdatedUsers';
    const res = await fetch(url);

    const updatedUserData = (await res.json()) as LCUser[];
    console.log(updatedUserData);
    setUserData(updatedUserData);
  };

  return (
    <div className="App">
      <p>{user?.data.user?.email || ''}</p>
      <button onClick={() => updateAllUsers()}>lole</button>
      {user ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => signInWithGitHub()}>Sign In with GitHub</button>
      )}
      {userData && userData.map((user, i) => <UserCard key={i} user={user} />)}
    </div>
  );
}

export default App;
