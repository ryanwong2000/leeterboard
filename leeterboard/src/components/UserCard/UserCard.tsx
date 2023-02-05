import React from 'react';
import type { Hacker } from '../../types/types';

export default function UserCard(props: { user: Hacker }) {
  const user = props.user;
  return (
    <tr className="row">
      <td className="user">
        <div className="avatarname">
          <img
            className="avatar"
            alt={`${user.username} avatar`}
            src={`https://github.com/${user.username}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src =
                'https://img.icons8.com/arcade/128/null/avatar.png';
            }}
          />
          <span> {user.username}</span>
        </div>
      </td>
      <td className="submittedToday">{user.submittedToday ? '✅' : '❌'}</td>
      <td className="streak">{user.streak}</td>
      <td className="lastAccepted">{user.recentSubmission.title}</td>
      <td className="language">{user.recentSubmission.lang}</td>
    </tr>
  );
}
