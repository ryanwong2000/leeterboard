import React, { useState, useEffect } from 'react';
import './App.css';
import { LeetCode } from 'leetcode-query';
import type { RecentSubmission, User } from '../types/types';
import UserCard from './components/UserCard';
const lc = new LeetCode();

function App() {
  const [userData, setUserData] = useState<User[]>([]);

  useEffect(() => {
    setUserData([
      {
        username: 'ryanwong2000',
        streak: 2,
        submittedToday: false
      }
    ]);
  }, []);

  const getSubmittedToday = async (
    username: string
  ): Promise<RecentSubmission | undefined> => {
    const submissions = await lc.recent_submissions(username);
    return submissions.find(
      (submission) =>
        submission.statusDisplay === 'Accepted' &&
        new Date(submission.timestamp).setHours(0, 0, 0, 0) ===
          new Date().setHours(0, 0, 0, 0)
    );
  };

  const updateAllUsers = async () => {
    console.log('called update all users');

    let temp = await Promise.all(
      userData.map(async (user): Promise<User> => {
        if (await getSubmittedToday(user.username)) {
          user.submittedToday = true;
          user.streak++;
        } else {
          user.submittedToday = false;
          user.streak = 0;
        }
        console.log(user);

        return user;
      })
    );
    setUserData(temp);
  };

  return (
    <div className="App">
      <button onClick={() => updateAllUsers}>lole</button>
      {userData && userData.map((user, i) => <UserCard key={i} user={user} />)}
    </div>
  );
}

export default App;
