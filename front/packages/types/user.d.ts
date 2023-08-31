export type UserScore = {
  total_score: number;
  scores: {
    [timestamp: string]: number;
  };
  progression: {
    [kanji: string]: number;
  };
};

export type User = {
  name: string;
  email: string;
  friends: string[];
  permissions: string[];
  created_at: string;
  user_id: string;
  deleted_at: string;
  applications: {
    word?: UserScore;
    kanji?: UserScore;
  };
};
