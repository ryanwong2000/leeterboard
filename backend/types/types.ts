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

interface LCUser {
  id: number;
  username: string;
  submittedToday: boolean;
  streak: number;
  lastUpdated: Date;
  lastSubmitted: Date;
  lang: string;
  statusDisplay: string;
  timestamp: Date;
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

export type { LeetCodeQuerySubmission, RecentSubmission, LCUser };
