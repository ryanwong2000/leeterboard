interface Submission {
  lang: string;
  statusDisplay: string;
  timestamp: string | Date;
  title: string;
  titleSlug: string;
}

interface LeetCodeQuerySubmission extends Submission {
  timestamp: string;
}

interface RecentSubmission extends Submission {
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

interface LCUser {
  id: number;
  username: string;
  submittedToday: boolean;
  streak: number;
  lastUpdated: Date;
  lastSubmitted: Date;
  recentSubmission: RecentSubmission;
}

interface SBUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: Date;
  provider: string;
}

export type { LeetCodeQuerySubmission, RecentSubmission, LCUser, UserSchema };
