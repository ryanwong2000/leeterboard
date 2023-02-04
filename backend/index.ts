import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import bodyParser from 'body-parser';
import type { RecentSubmission, UserSchema, Hacker } from './types/types';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

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

const updateSupabase = async (user: UserSchema) => {
  const { error }: { error: any; } = await supabase
    .from('User Data')
    .update({ ...user })
    .eq('username', user.username);
  if (error) {
    console.log('ERROR updateSupabase', error);
  } else {
    console.log('UPDATED supabase', user);
  }
};

const bulkUpdateSupabase = async (users: UserSchema[]) => {
  const { data, error } = await supabase.from('User Data').upsert(users);
  if (error) {
    console.log('ERROR updateSupabase', error);
  } else {
    console.log('UPDATED supabase', users);
  }
};

const userSchemaToHacker = (user: UserSchema): Hacker => {
  return {
    ...user,
    lastUpdated: stringToDate(user.lastUpdated),
    lastSubmitted: stringToDate(user.lastSubmitted),
    recentSubmission: {
      ...user,
      timestamp: new Date(user.timestamp)
    }
  };
};

const stringToDate = (dateString: string) => {
  // Convert the string to use commas instead of dashes (idk why but it works this way)
  return new Date(dateString.replace('-', ','));
};

const submissionIsLate = (submission: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const submissionDate = stringToDate(submission);
  return submissionDate < yesterday;
};

const getUpdatedUserData = async (user: UserSchema): Promise<UserSchema> => {
  let lcqRecentSubmission;
  try {
    lcqRecentSubmission = await getRecentAcceptedSubmission(user.username);
  } catch (error) {
    console.log('ERROR', error);
  }
  if (typeof lcqRecentSubmission === 'undefined') {
    return user;
  }

  if (user)
    console.log(
      `${user.username}. Recent Submission: ${JSON.stringify(
        lcqRecentSubmission
      )}`
    );

  const newSubmissionDate = new Date(
    Number(lcqRecentSubmission?.timestamp) * 1000
  );

  // More recent submission than last submission, update last submission timestamp
  if (newSubmissionDate > stringToDate(user.lastSubmitted)) {
    user.lastSubmitted = new Date(
      newSubmissionDate.getFullYear(),
      newSubmissionDate.getMonth(),
      newSubmissionDate.getDate()
    ).toLocaleDateString();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Submitted > 1 day ago -> Reset streak
  if (submissionIsLate(user.lastSubmitted)) {
    user.streak = 0;
  }

  // Didn't update yet today and submitted today -> Increment streak
  else if (
    stringToDate(user.lastUpdated) < today &&
    newSubmissionDate.toLocaleDateString() === today.toLocaleDateString()
  ) {
    user.streak++;
    user.lastUpdated = new Date(today).toLocaleDateString();
  }

  const res = {
    username: user.username,
    submittedToday: user.lastSubmitted === today.toLocaleDateString(),
    streak: user.streak,
    lastUpdated: user.lastUpdated,
    lastSubmitted: user.lastSubmitted,
    lang: lcqRecentSubmission.lang,
    title: lcqRecentSubmission.title,
    titleSlug: lcqRecentSubmission.titleSlug,
    statusDisplay: lcqRecentSubmission.statusDisplay,
    timestamp: newSubmissionDate.toISOString()
  };

  return res;
};

app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { data, error }: { data: UserSchema[] | null; error: any; } =
    await supabase.from('User Data').select();

  const userData: UserSchema[] = data ?? [];

  const updatedUserData = await Promise.all(userData.map(getUpdatedUserData));
  const hackers = updatedUserData.map(userSchemaToHacker);
  res.status(200).json(hackers);
  // updatedUserData.map((user) => updateSupabase(user));
  bulkUpdateSupabase(updatedUserData);
});

app.post('/createNewUser', async (req: Request, res: Response) => {
  const username = req.body.username;

  const { data, error } = await supabase
    .from('User Data')
    .insert({ username: username })
    .select();
  if (error) {
    console.log('ERROR inserting new user', username, error);
    res.status(409).json(error);
  }
  else {
    console.log('INSERTED', data);
    res.status(200).json(data);
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
