import React from 'react';
import { Hacker } from '../../types/types';
import UserCard from '../UserCard/UserCard';
import './Board.css';

interface BoardProps {
  userData: Hacker[];
}

export const Board = ({ userData }: BoardProps) => {
  return (
    <div className="container">
      <h1>Leeterboard</h1>
      <div className="board">
        <table>
          <thead>
            <tr className="row header">
              <th className="user">User</th>
              <th className="submittedToday">Today</th>
              <th className="streak">Streak</th>
              <th className="lastAccepted">Last Problem</th>
              <th className="language">Language</th>
            </tr>
          </thead>
          <tbody>
            {userData &&
              userData.map((user, i) => <UserCard key={i} user={user} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
