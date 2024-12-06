export const formatScore = (score: number) => {
  if (score >= 1000000) return `${(score / 1000000).toFixed(2)}M`;
  if (score >= 1000) return `${(score / 1000).toFixed(2)}K`;
  return score;
};

export const formatDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};
