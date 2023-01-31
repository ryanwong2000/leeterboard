import type { RecentSubmission as LCQRecentSubmission } from 'leetcode-query';

interface RecentSubmission extends Omit<LCQRecentSubmission, 'timestamp'> {
  timestamp: Date;
}

interface UserSchema {
  id: number;
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

interface SBUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: Date;
  provider: string;
}

interface Hacker {
  id: number;
  username: string;
  submittedToday: boolean;
  streak: number;
  lastUpdated: Date;
  lastSubmitted: Date;
  recentSubmission: RecentSubmission;
}

export type { RecentSubmission, UserSchema, Hacker };
