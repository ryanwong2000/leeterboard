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
const getSubmittedToday = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield lc.recent_submissions(username);
    return submissions.find((submission) => submission.statusDisplay === 'Accepted' &&
        new Date(submission.timestamp).setHours(0, 0, 0, 0) ===
            new Date().setHours(0, 0, 0, 0));
});
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.get('/getUpdatedUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userData } = req.body;
    const updatedUserData = yield Promise.all(userData.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (yield getSubmittedToday(user.username)) {
            user.submittedToday = true;
            user.streak++;
        }
        else {
            user.submittedToday = false;
            user.streak = 0;
        }
        console.log(user);
        return user;
    })));
    res.status(200).json(updatedUserData);
}));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
