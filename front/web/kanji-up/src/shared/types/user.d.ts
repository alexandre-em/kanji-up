type UserScore = {
  total_score: number;
  scores: {
    [timestamp: string]: number;
  };
  progression: {
    [elt: string]: number;
  };
};

type UserApplicationScore = {
  word?: UserScore;
  kanji?: UserScore;
};

type User = {
  name: string;
  email: string;
  password?: string;
  friends?: UserFollow;
  followers?: UserFollow;
  permissions: string[];
  created_at: string;
  user_id: string;
  deleted_at: string;
  applications?: UserApplicationScore;
};

type UserRank = {
  name: string;
  user_id: string;
  applications: {
    kanji?: {
      total_score: number;
    };
    word?: {
      total_score: number;
    };
  };
}[];

type UserFollow = {
  name: string;
  user_id: string;
}[];

type UserSearchResult = {
  name: 'string';
  created_at: 'string';
  user_id: 'string';
}[];
