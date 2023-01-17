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
import bodyParser from 'body-parser';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const lc = new LeetCode();
const getRecentAcceptedSubmission = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield lc.recent_submissions(username);
    return submissions.find((submission) => submission.statusDisplay === 'Accepted');
});
app.use(cors());
app.use(express.json());
const jsonParser = bodyParser.json();
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.post('/getUpdatedUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userData } = req.body;
    console.log(`user data is: ${userData}`);
    console.log(`req.body is: ${JSON.stringify(req.body)}`);
    const updatedUserData = yield Promise.all(userData.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        const dayInMilliseconds = 24 * 60 * 60 * 1000;
        let lastSubmittedFixed = new Date(user.lastSubmitted).setHours(0, 0, 0, 0);
        console.log(`Last submitted date: ${new Date(user.lastSubmitted).setHours(0, 0, 0, 0)}`);
        let lastUpdatedFixed = new Date(user.lastUpdated).setHours(0, 0, 0, 0);
        const recentSubmission = yield getRecentAcceptedSubmission(user.username);
        const today = new Date().setHours(0, 0, 0, 0);
        const cleanTimestamp = Number(recentSubmission === null || recentSubmission === void 0 ? void 0 : recentSubmission.timestamp) * 1000;
        const newSubmissionDate = new Date(cleanTimestamp).setHours(0, 0, 0, 0);
        // More recent submission than last submission, update last submission timestamp
        if (newSubmissionDate > lastSubmittedFixed) {
            lastSubmittedFixed = newSubmissionDate;
            user.lastSubmitted = new Date(newSubmissionDate);
        }
        console.log(`${user.username}. Recent Submission: ${JSON.stringify(recentSubmission)}`);
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
    })));
    res.status(200).json(updatedUserData);
}));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
