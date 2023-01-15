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
import dotenv from 'dotenv';
import { LeetCode } from 'leetcode-query';
import bodyParser from 'body-parser';
dotenv.config();
const app = express();
const port = process.env.PORT || 3005;
const lc = new LeetCode();
const getRecentAcceptedSubmission = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield lc.recent_submissions(username);
    return submissions.find((submission) => submission.statusDisplay === 'Accepted');
});
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.get('/getUpdatedUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userData } = req.body;
    const updatedUserData = yield Promise.all(userData.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        const dayInMilliseconds = 24 * 60 * 60 * 1000;
        const recentSubmission = yield getRecentAcceptedSubmission(user.username);
        let lastSubmittedFixed = new Date(user.lastSubmitted).setHours(0, 0, 0, 0);
        console.log(`Last submitted date: ${new Date(user.lastSubmitted).setHours(0, 0, 0, 0)}`);
        const today = new Date().setHours(0, 0, 0, 0);
        const cleanTimestamp = Number(recentSubmission === null || recentSubmission === void 0 ? void 0 : recentSubmission.timestamp) * 1000;
        const submissionTimestampFixed = new Date(cleanTimestamp).setHours(0, 0, 0, 0);
        // More recent submission than last submission, update last submission timestamp
        // if (submissionTimestampFixed > lastSubmittedFixed) {
        //   lastSubmittedFixed = submissionTimestampFixed;
        //   user.lastSubmitted = new Date(submissionTimestampFixed);
        // }
        console.log(`${user.username}. Recent Submission: ${JSON.stringify(recentSubmission)}`);
        // Submitted > 1 day ago -> Reset streak
        if (lastSubmittedFixed < today - dayInMilliseconds) {
            user.streak = 0;
            user.submittedToday = false;
        }
        // Submitted 1 day ago -> Increase streak
        else if (lastSubmittedFixed < today) {
            user.streak++;
            user.submittedToday = false;
        }
        // Submitted today -> Keep streak (can't increase multiple times in same day)
        else if (lastSubmittedFixed === today) {
            user.submittedToday = true;
        }
        if (submissionTimestampFixed > lastSubmittedFixed) {
            lastSubmittedFixed = submissionTimestampFixed;
            user.lastSubmitted = new Date(submissionTimestampFixed);
        }
        user.lastUpdated = new Date(today);
        console.log(user);
        return user;
    })));
    res.status(200).json(updatedUserData);
}));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
