import React from 'react';
import { LCUser } from '../../../types/types';
import UserCard from '../UserCard/UserCard';
import './Board.css';

interface BoardProps {
  userData: LCUser[];
}

export const Board = ({ userData }: BoardProps) => {
  return (
    <table className="container">
      <tr>
        <th>User</th>
        <th>streak</th>
        <th>Today</th>
        <th>Last Problem Accepted</th>
        <th>Language</th>
      </tr>
      {userData && userData.map((user, i) => <UserCard key={i} user={user} />)}
    </table>
  );
};
