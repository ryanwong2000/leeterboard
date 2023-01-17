import express from 'express';
import cors from 'cors';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import bodyParser from 'body-parser';
import type { RecentSubmission, User } from './types/types';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const lc = new LeetCode();

const getRecentAcceptedSubmission = async (
  username: string
): Promise<RecentSubmission | undefined> => {
  const submissions: RecentSubmission[] = await lc.recent_submissions(username);
  return submissions.find(
    (submission: RecentSubmission) => submission.statusDisplay === 'Accepted'
  );
};

app.use(cors());
app.use(express.json());

const jsonParser = bodyParser.json();

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { userData }: { userData: User[] } = req.body;

  console.log(`user data is: ${userData}`);
  console.log(`req.body is: ${JSON.stringify(req.body)}`);

  const updatedUserData = await Promise.all(
    userData.map(async (user: User): Promise<User> => {
      const dayInMilliseconds = 24 * 60 * 60 * 1000;

      // Clean user dates (submitted and updated times)
      let lastSubmittedFixed = new Date(user.lastSubmitted).setHours(
        0,
        0,
        0,
        0
      );
      let lastUpdatedFixed = new Date(user.lastUpdated).setHours(0, 0, 0, 0);

      const recentSubmission = await getRecentAcceptedSubmission(user.username);

      // Convert recent submission timestamp to date
      const newSubmissionDate = new Date(
        Number(recentSubmission?.timestamp) * 1000
      ).setHours(0, 0, 0, 0);

      const today = new Date().setHours(0, 0, 0, 0);

      // More recent submission than last submission, update last submission timestamp
      if (newSubmissionDate > lastSubmittedFixed) {
        lastSubmittedFixed = newSubmissionDate;
        user.lastSubmitted = new Date(newSubmissionDate);
      }

      console.log(
        `${user.username}. Recent Submission: ${JSON.stringify(
          recentSubmission
        )}`
      );

      // Submitted > 1 day ago -> Reset streak
      if (lastSubmittedFixed < today - dayInMilliseconds) {
        user.streak = 0;
      }

      // Didn't update yet today and submitted today -> Increment streak
      else if (lastUpdatedFixed < today && lastSubmittedFixed === today) {
        user.streak++;
      }

      // Set submitted today if submitted today
      user.submittedToday = lastSubmittedFixed === today;

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
