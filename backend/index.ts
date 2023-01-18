import express from 'express';
import cors from 'cors';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import bodyParser from 'body-parser';
import type { LCSubmission, RecentSubmission, LCUser } from './types/types';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const lc = new LeetCode();

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseKey: string = process.env.SUPABASE_KEY || '';
const supabaseSecret: string = process.env.SUPABASE_SECRET || '';

const supabase = createClient(supabaseUrl, supabaseSecret);

const getRecentAcceptedSubmission = async (
  username: string
): Promise<LCSubmission | undefined> => {
  const submissions: LCSubmission[] = await lc.recent_submissions(username);
  return submissions.find(
    (submission: LCSubmission) => submission.statusDisplay === 'Accepted'
  );
};

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { data, error }: { data: LCUser[] | null; error: any } = await supabase
    .from('UserData')
    .select();

  const userData = data ?? [];

  const updatedUserData = await Promise.all(
    userData.map(async (user: LCUser): Promise<LCUser> => {
      const dayInMilliseconds = 24 * 60 * 60 * 1000;

      // Clean user dates (submitted and updated times)
      let lastSubmittedFixed = new Date(user.lastSubmitted).setHours(
        0,
        0,
        0,
        0
      );
      let lastUpdatedFixed = new Date(user.lastUpdated).setHours(0, 0, 0, 0);

      const lcSubmission = await getRecentAcceptedSubmission(user.username);

      if (typeof lcSubmission === 'undefined') {
        return user;
      }

      // Convert recent submission timestamp to date
      const newSubmissionDate = new Date(
        Number(lcSubmission?.timestamp) * 1000
      ).setHours(0, 0, 0, 0);

      const recentSubmission: RecentSubmission = {
        ...lcSubmission,
        timestamp: new Date(newSubmissionDate)
      };

      const today = new Date().setHours(0, 0, 0, 0);

      // More recent submission than last submission, update last submission timestamp
      if (newSubmissionDate > lastSubmittedFixed) {
        lastSubmittedFixed = newSubmissionDate;
        user.lastSubmitted = new Date(newSubmissionDate);
      }

      console.log(
        `${user.username}. Recent Submission: ${JSON.stringify(lcSubmission)}`
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

      const { error }: { error: any } = await supabase
        .from('UserData')
        .update({
          ...user,
          ...recentSubmission
        })
        .eq('id', user.id);

      console.log(error);

      return user;
    })
  );

  res.status(200).json(updatedUserData);
});

app.post('createNewUser', async (req: Request, res: Response) => {});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
