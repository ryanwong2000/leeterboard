import React, { useState, useEffect } from 'react';
import './App.css';
import type { RecentSubmission, User } from '../types/types';
import UserCard from './components/UserCard';

function App() {
  const [userData, setUserData] = useState<User[]>([]);

  useEffect(() => {
    console.log('useEffect');
    setUserData([
      // {
      //   username: 'ryanwong2000',
      //   streak: 4,
      //   submittedToday: false,
      //   lastUpdated: new Date('2023-01-15'),
      //   lastSubmitted: new Date('2023-01-16')
      // },
      // {
      //   username: 'Adamo-O',
      //   streak: 7,
      //   submittedToday: false,
      //   lastUpdated: new Date('2023-01-15'),
      //   lastSubmitted: new Date('2023-01-15')
      // }
    ]);
  }, []);

  const updateAllUsers = async () => {
    console.log('called update all users');

    const url = 'http://localhost:5000/getUpdatedUsers';
    const res = await fetch(url);

    const updatedUserData = (await res.json()) as User[];
    console.log(updatedUserData);
    setUserData(updatedUserData);
  };

  return (
    <div className="App">
      <button onClick={() => updateAllUsers()}>lole</button>
      {userData && userData.map((user, i) => <UserCard key={i} user={user} />)}
    </div>
  );
}

export default App;
