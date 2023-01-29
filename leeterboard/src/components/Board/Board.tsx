import React from 'react';
import { LCUser } from '../../../types/types';
import UserCard from '../UserCard/UserCard';
import './Board.css';

interface BoardProps {
  userData: LCUser[];
}

export const Board = ({ userData }: BoardProps) => {
  return (
    <div className="board">
      <h1>Leeterboard</h1>
      <table>
        <thead>
          <tr className="row">
            <th className="name">User</th>
            <th className="streak">Streak</th>
            <th className="submittedToday">Today</th>
            <th className="lastAccepted">Last Problem</th>
            <th className="language">Language</th>
          </tr>
        </thead>
        <tbody>{userData && userData.map((user, i) => <UserCard key={i} user={user} />)}</tbody>
      </table>
    </div>
  );
};
