import React from 'react';
// import { Card, CardContent } from '@mui/material';
import type { User, RecentSubmission } from '../../types/types';

export default function UserCard(props: { user: User }) {
  return (
    <>
      <div>
        <h4>{props.user.username}</h4>
        <p>Streak: {props.user.streak}</p>
        <p>Today: {props.user.submittedToday ? 'true' : 'false'}</p>
      </div>
    </>
  );
}
