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

const stringToDate = (dateString: string) => {
  // Convert the string to use commas instead of dashes (idk why but it works this way)
  return new Date(dateString.replace('-', ','));
};
/**
 * Does not have time
 */
const dateToString = (date: Date) => {
  return date.toISOString().split('T')[0];
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

  const dayInMilliseconds = 24 * 60 * 60 * 1000;

  if (user)
    console.log(
      `${user.username}. Recent Submission: ${JSON.stringify(
        lcqRecentSubmission
      )}`
    );

  // Convert recent submission timestamp to date
  // the TS from LC is in UTC so we make it EST
  const timestamp = new Date(Number(lcqRecentSubmission?.timestamp) * 1000);

  const recentSubmission: RecentSubmission = {
    ...lcqRecentSubmission,
    timestamp: timestamp
  };

  const newSubmissionFixed = new Date(timestamp);

  newSubmissionFixed.setHours(0, 0, 0, 0);

  // Clean user dates (submitted and updated times)
  let lastSubmittedFixed = stringToDate(user.lastSubmitted);
  const lastUpdatedFixed = stringToDate(user.lastUpdated);

  // More recent submission than last submission, update last submission timestamp
  if (newSubmissionFixed > lastSubmittedFixed) {
    lastSubmittedFixed = newSubmissionFixed;
    user.lastSubmitted = dateToString(
      new Date(
        newSubmissionFixed.getFullYear(),
        newSubmissionFixed.getMonth(),
        newSubmissionFixed.getDate()
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

  // user = {
  //   ...user,
  //   ...recentSubmission,
  //   submittedToday: lastSubmittedFixed.valueOf() === today,
  //   lastUpdated: dateToString(new Date(today)),
  //   timestamp: timestamp.toISOString()
  // };

  // Update the database entity
  // const { error }: { error: any } = await supabase
  //   .from('UserData')
  //   .update({ ...user })
  //   .eq('username', user.username);

  return {
    username: user.username,
    submittedToday: lastSubmittedFixed.valueOf() === today,
    streak: user.streak,
    lastUpdated: new Date(today).toLocaleString(),
    lastSubmitted: lastSubmittedFixed,
    recentSubmission: {
      lang: recentSubmission.lang,
      title: recentSubmission.title,
      titleSlug: recentSubmission.titleSlug,
      statusDisplay: recentSubmission.statusDisplay,
      timestamp: timestamp
    }
  };
};

app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
  const { data, error }: { data: UserSchema[] | null; error: any } =
    await supabase.from('UserData').select();

  const userData: UserSchema[] = data ?? [];

  const updatedUserData = await Promise.all(userData.map(getUpdatedUserData));
  res.status(200).json(updatedUserData);
});

// app.get('/getUpdatedUsers', async (req: Request, res: Response) => {
//   const { error }: { error: any } = await supabase
//     .from('UserData')
//     .update({
//       streak: 7,
//       lastUpdated: new Date(2023, 1, 15, 23).toLocaleDateString()
//     })
//     .eq('username', 'kalsij');

//   console.log('killymonjaro');
//   res.status(200).json({});
// });

// app.post('createNewUser', async (req: Request, res: Response) => {
//   const username = req.body.username;
//   let lcqRecentSubmission;
//   try {
//     lcqRecentSubmission = await getRecentAcceptedSubmission(username);
//   } catch (error) {
//     console.log('ERROR', error);
//   }

//   const userData: UserSchema = {
//     username: username,
//     submittedToday: new Date(Number(lcqRecentSubmission?.timestamp)) == new Date()
//   }

//   const { data, error } = await supabase.from('UserData').insert();
// });

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
