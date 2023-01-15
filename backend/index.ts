import express from 'express';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import bodyParser from 'body-parser';
import type { RecentSubmission, User } from './types/types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

const lc = new LeetCode();

const getRecentAcceptedSubmission = async (
  username: string
): Promise<RecentSubmission | undefined> => {
  const submissions: RecentSubmission[] = await lc.recent_submissions(username);
  return submissions.find(
    (submission: RecentSubmission) => submission.statusDisplay === 'Accepted'
  );
};

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { userData }: { userData: User[] } = req.body;

  const updatedUserData = await Promise.all(
    userData.map(async (user: User): Promise<User> => {
      const dayInMilliseconds = 24 * 60 * 60 * 1000;

      const recentSubmission = await getRecentAcceptedSubmission(user.username);
      let lastSubmittedFixed = new Date(user.lastSubmitted).setHours(
        0,
        0,
        0,
        0
      );
      console.log(
        `Last submitted date: ${new Date(user.lastSubmitted).setHours(
          0,
          0,
          0,
          0
        )}`
      );

      const today = new Date().setHours(0, 0, 0, 0);
      const cleanTimestamp = Number(recentSubmission?.timestamp) * 1000;
      const submissionTimestampFixed = new Date(cleanTimestamp).setHours(
        0,
        0,
        0,
        0
      );

      // More recent submission than last submission, update last submission timestamp
      // if (submissionTimestampFixed > lastSubmittedFixed) {
      //   lastSubmittedFixed = submissionTimestampFixed;
      //   user.lastSubmitted = new Date(submissionTimestampFixed);
      // }

      console.log(
        `${user.username}. Recent Submission: ${JSON.stringify(
          recentSubmission
        )}`
      );

      // Submitted > 1 day ago -> Reset streak
      if (lastSubmittedFixed < today - dayInMilliseconds) {
        user.streak = 0;
        user.submittedToday = false;
      }
      // Submitted 1 day ago -> Increase streak
      else if (lastSubmittedFixed < today) {
        user.streak++;
        user.submittedToday = false;
      }
      // Submitted today -> Keep streak (can't increase multiple times in same day)
      else if (lastSubmittedFixed === today) {
        user.submittedToday = true;
      }

      if (submissionTimestampFixed > lastSubmittedFixed) {
        lastSubmittedFixed = submissionTimestampFixed;
        user.lastSubmitted = new Date(submissionTimestampFixed);
      }

      user.lastUpdated = new Date(today);
      console.log(user);

      return user;
    })
  );
  res.status(200).json(updatedUserData);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
