var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import { createClient } from '@supabase/supabase-js';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const lc = new LeetCode();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabaseSecret = process.env.SUPABASE_SECRET || '';
const supabase = createClient(supabaseUrl, supabaseSecret);
const getRecentAcceptedSubmission = (username) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield lc.recent_submissions(username);
    return submissions.find(
      (submission) => submission.statusDisplay === 'Accepted'
    );
  });
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});
app.get('/getUpdatedUsers', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase.from('UserData').select();
    const userData = data !== null && data !== void 0 ? data : [];
    console.log('userData', userData);
    const updatedUserData = yield Promise.all(
      userData.map((user) =>
        __awaiter(void 0, void 0, void 0, function* () {
          const dayInMilliseconds = 24 * 60 * 60 * 1000;
          // Convert the string to use commas instead of dashes
          const lastSubmittedString = user.lastSubmitted.replace('-', ',');
          const lastUpdatedString = user.lastUpdated.replace('-', ',');
          // Clean user dates (submitted and updated times)
          let lastSubmittedFixed = new Date(lastSubmittedString);
          let lastUpdatedFixed = new Date(lastUpdatedString);
          const LCQRecentSubmission = yield getRecentAcceptedSubmission(
            user.username
          );
          if (typeof LCQRecentSubmission === 'undefined') {
            return user;
          }
          // Convert recent submission timestamp to date
          const newSubmissionDate = new Date(
            Number(
              LCQRecentSubmission === null || LCQRecentSubmission === void 0
                ? void 0
                : LCQRecentSubmission.timestamp
            ) * 1000
          );
          const timestamp = new Date(newSubmissionDate);
          console.log(timestamp);
          console.log(timestamp.toISOString());
          const recentSubmission = Object.assign(
            Object.assign({}, LCQRecentSubmission),
            { timestamp: new Date(newSubmissionDate) }
          );
          newSubmissionDate.setHours(0, 0, 0, 0);
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
              LCQRecentSubmission
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
            user.timestamp = timestamp.toISOString();
          }
          // Set submitted today if submitted today
          user.submittedToday = lastSubmittedFixed.valueOf() === today;
          user.lastUpdated = new Date(today).toISOString().split('T')[0];
          user = Object.assign(
            Object.assign(Object.assign({}, user), recentSubmission),
            { timestamp: timestamp.toISOString() }
          );
          console.log(user);
          // Update the database entity
          const { error } = yield supabase
            .from('UserData')
            .update(Object.assign({}, user))
            .eq('id', user.id);
          // console.log(user);
          return user;
        })
      )
    );
    res.status(200).json(updatedUserData);
  })
);
app.post('createNewUser', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {})
);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
