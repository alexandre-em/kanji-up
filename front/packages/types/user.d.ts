export type UserScore = {
  total_score: number;
  scores: {
    [timestamp: string]: number;
  };
  progression: {
    [kanji: string]: number;
  };
};

export type UserApplicationScore = {
  word?: UserScore;
  kanji?: UserScore;
};

export type User = {
  name: string;
  email: string;
  friends: Array<Partial<User>>;
  permissions: string[];
  created_at: string;
  user_id: string;
  deleted_at: string;
  applications: UserApplicationScore;
};
