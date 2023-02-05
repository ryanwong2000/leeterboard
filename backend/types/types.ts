import type { RecentSubmission as LCQRecentSubmission } from 'leetcode-query';

interface RecentSubmission extends Omit<LCQRecentSubmission, 'timestamp'> {
  timestamp: Date;
}

interface UserSchema {
  username: string;
  submittedToday: boolean;
  streak: number;
  lastUpdated: string;
  lastSubmitted: string;
  lang: string;
  statusDisplay: string;
  timestamp: string;
  title: string;
  titleSlug: string;
}

interface Hacker {
  username: string;
  submittedToday: boolean;
  streak: number;
  lastUpdated: Date;
  lastSubmitted: Date;
  recentSubmission: RecentSubmission;
}

export type { RecentSubmission, UserSchema, Hacker };
