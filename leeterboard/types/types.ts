interface Submission {
  lang: string;
  statusDisplay: string;
  timestamp: string | Date;
  title: string;
  titleSlug: string;
}

interface LCSubmission extends Submission {
  timestamp: string;
}

interface RecentSubmission extends Submission {
  timestamp: Date;
}

interface User {
  id: number;
  username: string;
  submittedToday: boolean;
  streak: number;
  lastUpdated: Date;
  lastSubmitted: Date;
}

export type { LCSubmission, RecentSubmission, User };
