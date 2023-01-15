import React, { useState, useEffect } from 'react';
import './App.css';
import type { RecentSubmission, User } from '../types/types';
import UserCard from './components/UserCard';

function App() {
  const [userData, setUserData] = useState<User[]>([]);

  useEffect(() => {
    console.log('useEffect');
    setUserData([
      {
        username: 'ryanwong2000',
        streak: 4,
        submittedToday: false,
        lastUpdated: new Date('2023-01-13'),
        lastSubmitted: new Date('2023-01-14')
      }
    ]);
  }, []);

  const updateAllUsers = async () => {
    console.log('called update all users');

    const url = 'http://localhost:3005/getupdatedusers';
    const res = await fetch(url);
    const updatedUserData = await res.json();
    setUserData(updatedUserData);
  };

  return (
    <div className="App">
      <button onClick={() => updateAllUsers}>lole</button>
      {userData && userData.map((user, i) => <UserCard key={i} user={user} />)}
    </div>
  );
}

export default App;
