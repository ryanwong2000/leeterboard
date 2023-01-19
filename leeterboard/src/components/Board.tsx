import React from 'react';
import { LCUser } from '../../types/types';
import UserCard from './UserCard';

interface BoardProps {
  userData: LCUser[];
}

export const Board = ({ userData }: BoardProps) => {
  return (
    <div>
      {userData && userData.map((user, i) => <UserCard key={i} user={user} />)}
    </div>
  );
};
