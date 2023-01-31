import React from 'react';
import type { Hacker } from '../../types/types';

export default function UserCard(props: { user: Hacker }) {
  return (
    <tr className="row">
      <td className="user">
        <div className="avatarname">
          <img
            className="avatar"
            alt={`${props.user.username} avatar`}
            src={`https://github.com/${props.user.username}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src =
                'https://img.icons8.com/arcade/128/null/avatar.png';
            }}
          />
          <span> {props.user.username}</span>
        </div>
      </td>
      <td className="submittedToday">
        {props.user.submittedToday ? '✅' : '❌'}
      </td>
      <td className="streak">{props.user.streak}</td>
      <td className="lastAccepted">{props.user.recentSubmission.title}</td>
      <td className="language">{props.user.recentSubmission.lang}</td>
    </tr>
  );
}
