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

const getSubmittedToday = async (
  username: string
): Promise<RecentSubmission | undefined> => {
  const submissions = await lc.recent_submissions(username);
  return submissions.find(
    (submission: RecentSubmission) =>
      submission.statusDisplay === 'Accepted' &&
      new Date(submission.timestamp).setHours(0, 0, 0, 0) ===
        new Date().setHours(0, 0, 0, 0)
  );
};

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { userData } = req.body;

  const updatedUserData = await Promise.all(
    userData.map(async (user: User): Promise<User> => {
      if (await getSubmittedToday(user.username)) {
        user.submittedToday = true;
        user.streak++;
      } else {
        user.submittedToday = false;
        user.streak = 0;
      }
      console.log(user);

      return user;
    })
  );
  res.status(200).json(updatedUserData);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
