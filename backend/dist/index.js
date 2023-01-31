var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
app.use(cors());
app.use(express.json());
const lc = new LeetCode();
const getRecentAcceptedSubmission = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissions = yield lc.recent_submissions(username);
        return submissions.find((submission) => submission.statusDisplay === 'Accepted');
    }
    catch (error) {
        console.log('ERROR', error);
        return;
    }
});
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabaseSecret = process.env.SUPABASE_SECRET || '';
const supabase = createClient(supabaseUrl, supabaseSecret);
const stringToDate = (dateString) => {
    // Convert the string to use commas instead of dashes (idk why but it works this way)
    return new Date(dateString.replace('-', ','));
};
const dateToString = (date) => {
    return date.toISOString().split('T')[0];
};
const getUpdatedUserData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dayInMilliseconds = 24 * 60 * 60 * 1000;
        // Clean user dates (submitted and updated times)
        let lastSubmittedFixed = stringToDate(user.lastSubmitted);
        let lastUpdatedFixed = stringToDate(user.lastUpdated);
        const lcqRecentSubmission = yield getRecentAcceptedSubmission(user.username);
        if (typeof lcqRecentSubmission === 'undefined') {
            return user;
        }
        console.log(`${user.username}. Recent Submission: ${JSON.stringify(lcqRecentSubmission)}`);
        // Convert recent submission timestamp to date
        const newSubmissionDate = new Date(Number(lcqRecentSubmission === null || lcqRecentSubmission === void 0 ? void 0 : lcqRecentSubmission.timestamp) * 1000);
        const timestamp = new Date(newSubmissionDate);
        const recentSubmission = Object.assign(Object.assign({}, lcqRecentSubmission), { timestamp: timestamp });
        newSubmissionDate.setHours(0, 0, 0, 0);
        // More recent submission than last submission, update last submission timestamp
        if (newSubmissionDate > lastSubmittedFixed) {
            lastSubmittedFixed = newSubmissionDate;
            user.lastSubmitted = dateToString(new Date(newSubmissionDate.getFullYear(), newSubmissionDate.getMonth(), newSubmissionDate.getDate()));
        }
        const today = new Date().setHours(0, 0, 0, 0);
        // Submitted > 1 day ago -> Reset streak
        if (lastSubmittedFixed.valueOf() < today - dayInMilliseconds) {
            user.streak = 0;
        }
        // Didn't update yet today and submitted today -> Increment streak
        else if (lastUpdatedFixed.valueOf() < today &&
            lastSubmittedFixed.valueOf() === today) {
            user.streak++;
            user.timestamp = timestamp.toISOString();
        }
        user = Object.assign(Object.assign(Object.assign({}, user), recentSubmission), { submittedToday: lastSubmittedFixed.valueOf() === today, lastUpdated: dateToString(new Date(today)), timestamp: timestamp.toISOString() });
        // Update the database entity
        const { error } = yield supabase
            .from('UserData')
            .update(Object.assign({}, user))
            .eq('id', user.id);
    }
    catch (error) {
        console.log('ERROR', error);
    }
    finally {
        return user;
    }
});
app.get('/getUpdatedUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase.from('UserData').select();
    const userData = data !== null && data !== void 0 ? data : [];
    // TODO: make this not concurrent (like da hackathon)
    const updatedUserData = yield Promise.all(userData.map(getUpdatedUserData));
    res.status(200).json(updatedUserData);
}));
app.post('createNewUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
