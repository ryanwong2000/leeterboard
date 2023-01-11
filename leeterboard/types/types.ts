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
}

export type { RecentSubmission, User };
