type DecodedToken = {
  name: string;
  email: string;
  sub: string;
  permissions: string[];
  iat: number;
  exp: number;
};

type Score = {
  total_score: number;
  scores: { [timestamp: string]: number };
  progressions: { [key: string]: number };
};
