import React from 'react';
import type { LCUser } from '../../types/types';

export default function UserCard(props: { user: LCUser }) {
  return (
    <>
      <div>
        <h4>{props.user.username}</h4>
        <p>Streak: {props.user.streak}</p>
        <div>
          <p>Today: {props.user.submittedToday ? 'true' : 'false'}</p>
          <p>Last Accepted: {props.user.title}</p>
          <p>Lang: {props.user.lang}</p>
        </div>
      </div>
    </>
  );
}
