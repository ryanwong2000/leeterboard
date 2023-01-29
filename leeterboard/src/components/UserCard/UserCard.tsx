import React from 'react';
import type { LCUser } from '../../../types/types';

export default function UserCard(props: { user: LCUser }) {
  return (
    <tr className="row">
      <td className="name">{props.user.username}</td>
      <td className="streak">{props.user.streak}</td>
      <td className="submittedToday">
        {props.user.submittedToday ? 'true' : 'false'}
      </td>
      <td className="lastAccepted">{props.user.title}</td>
      <td className="language">{props.user.lang}</td>
    </tr>
  );
}
