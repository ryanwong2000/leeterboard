import express from 'express';
import cors from 'cors';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import bodyParser from 'body-parser';
import type {
  LeetCodeQuerySubmission,
  RecentSubmission,
  LCUser,
  UserSchema
} from './types/types';
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
): Promise<LeetCodeQuerySubmission | undefined> => {
  const submissions: LeetCodeQuerySubmission[] = await lc.recent_submissions(
    username
  );
  return submissions.find(
    (submission: LeetCodeQuerySubmission) =>
      submission.statusDisplay === 'Accepted'
  );
};

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { data, error }: { data: UserSchema[] | null; error: any } =
    await supabase.from('UserData').select();

  const userData = data ?? [];
  // console.log('userData', userData);
  const updatedUserData = await Promise.all(
    userData.map(async (user: UserSchema): Promise<UserSchema> => {
      const dayInMilliseconds = 24 * 60 * 60 * 1000;

      const lastSubmittedString = user.lastSubmitted.replace('-', ',');
      const lastUpdatedString = user.lastUpdated.replace('-', ',');

      // Clean user dates (submitted and updated times)
      let lastSubmittedFixed = new Date(lastSubmittedString);

      let lastUpdatedFixed = new Date(lastUpdatedString);

      console.log(
        'lastUpdatedString',
        lastUpdatedString,
        'lastSubmittedString',
        lastSubmittedString,
        'lastSubmittedFixed',
        lastSubmittedFixed,
        'lastUpdatedFixed',
        lastUpdatedFixed
      );

      const LeetCodeQuerySubmission: LeetCodeQuerySubmission | undefined =
        await getRecentAcceptedSubmission(user.username);

      if (typeof LeetCodeQuerySubmission === 'undefined') {
        return user;
      }

      // Convert recent submission timestamp to date
      const newSubmissionDate = new Date(
        Number(LeetCodeQuerySubmission?.timestamp) * 1000
      );
      newSubmissionDate.setHours(0, 0, 0, 0);

      const recentSubmission: RecentSubmission = {
        ...LeetCodeQuerySubmission,
        timestamp: new Date(newSubmissionDate)
      };

      const today = new Date().setHours(0, 0, 0, 0);

      // More recent submission than last submission, update last submission timestamp
      if (newSubmissionDate > lastSubmittedFixed) {
        lastSubmittedFixed = newSubmissionDate;
        user.lastSubmitted = new Date(
          newSubmissionDate.getFullYear(),
          newSubmissionDate.getMonth(),
          newSubmissionDate.getDate()
        )
          .toISOString()
          .split('T')[0];
      }

      console.log(
        `${user.username}. Recent Submission: ${JSON.stringify(
          LeetCodeQuerySubmission
        )}`
      );

      // Submitted > 1 day ago -> Reset streak
      if (lastSubmittedFixed.valueOf() < today - dayInMilliseconds) {
        user.streak = 0;
      }

      // Didn't update yet today and submitted today -> Increment streak
      else if (
        lastUpdatedFixed.valueOf() < today &&
        lastSubmittedFixed.valueOf() === today
      ) {
        user.streak++;
      }

      // Set submitted today if submitted today
      user.submittedToday = lastSubmittedFixed.valueOf() === today;

      user.lastUpdated = new Date(today).toISOString().split('T')[0];

      const { error }: { error: any } = await supabase
        .from('UserData')
        .update({
          ...user,
          ...recentSubmission
        })
        .eq('id', user.id);

      return user;
    })
  );

  res.status(200).json(updatedUserData);
});

app.post('createNewUser', async (req: Request, res: Response) => {});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
