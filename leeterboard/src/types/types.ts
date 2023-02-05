interface RecentSubmission {
  lang: string;
  statusDisplay: string;
  title: string;
  titleSlug: string;
  timestamp: Date;
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

export type { RecentSubmission, Hacker };
