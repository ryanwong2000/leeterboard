import express from 'express';
import cors from 'cors';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import type { RecentSubmission as LCQRecentSubmission } from 'leetcode-query';
import bodyParser from 'body-parser';
import type { RecentSubmission, LCUser, UserSchema } from './types/types';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const lc = new LeetCode();

const getRecentAcceptedSubmission = async (username: string) => {
  try {
    const submissions = await lc.recent_submissions(username);
    return submissions.find(
      (submission) => submission.statusDisplay === 'Accepted'
    );
  } catch (error) {
    console.log('ERROR', error);
    return;
  }
};

const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseKey: string = process.env.SUPABASE_KEY || '';
const supabaseSecret: string = process.env.SUPABASE_SECRET || '';

const supabase = createClient(supabaseUrl, supabaseSecret);

const stringToDate = (dateString: string) => {
  // Convert the string to use commas instead of dashes (idk why but it works this way)
  return new Date(dateString.replace('-', ','));
};

const dateToString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getUpdatedUserData = async (user: UserSchema) => {
  try {
    const dayInMilliseconds = 24 * 60 * 60 * 1000;

    // Clean user dates (submitted and updated times)
    let lastSubmittedFixed = stringToDate(user.lastSubmitted);
    let lastUpdatedFixed = stringToDate(user.lastUpdated);

    const lcqRecentSubmission = await getRecentAcceptedSubmission(
      user.username
    );

    if (typeof lcqRecentSubmission === 'undefined') {
      return user;
    }

    console.log(
      `${user.username}. Recent Submission: ${JSON.stringify(
        lcqRecentSubmission
      )}`
    );

    // Convert recent submission timestamp to date
    const newSubmissionDate = new Date(
      Number(lcqRecentSubmission?.timestamp) * 1000
    );

    const timestamp = new Date(newSubmissionDate);

    const recentSubmission: RecentSubmission = {
      ...lcqRecentSubmission,
      timestamp: timestamp
    };

    newSubmissionDate.setHours(0, 0, 0, 0);

    // More recent submission than last submission, update last submission timestamp
    if (newSubmissionDate > lastSubmittedFixed) {
      lastSubmittedFixed = newSubmissionDate;
      user.lastSubmitted = dateToString(
        new Date(
          newSubmissionDate.getFullYear(),
          newSubmissionDate.getMonth(),
          newSubmissionDate.getDate()
        )
      );
    }

    const today: number = new Date().setHours(0, 0, 0, 0);

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
      user.timestamp = timestamp.toISOString();
    }

    user = {
      ...user,
      ...recentSubmission,
      submittedToday: lastSubmittedFixed.valueOf() === today,
      lastUpdated: dateToString(new Date(today)),
      timestamp: timestamp.toISOString()
    };

    // Update the database entity
    const { error }: { error: any } = await supabase
      .from('UserData')
      .update({ ...user })
      .eq('id', user.id);
  } catch (error) {
    console.log('ERROR', error);
  } finally {
    return user;
  }
};

app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { data, error }: { data: UserSchema[] | null; error: any } =
    await supabase.from('UserData').select();

  const userData: UserSchema[] = data ?? [];

  // TODO: make this not concurrent (like da hackathon)
  const updatedUserData = await Promise.all(userData.map(getUpdatedUserData));

  res.status(200).json(updatedUserData);
});

app.post('createNewUser', async (req: Request, res: Response) => {});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
