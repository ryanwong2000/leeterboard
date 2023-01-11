interface RecentSubmission {
  lang: string;
  statusDisplay: string;
  timestamp: string;
  title: string;
  titleSlug: string;
}

interface User {
  username: string;
  submittedToday: boolean;
  streak: number;
  lastUpdated: Date;
  lastSubmitted: Date;
}

export type { RecentSubmission, User };
