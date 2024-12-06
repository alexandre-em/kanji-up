import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useNavigation() {
  const navigate = useNavigate();

  const goToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToKanjis = useCallback(() => {
    navigate('/kanjis');
  }, [navigate]);

  const goToKanji = useCallback(
    (id: string) => {
      navigate(`/kanjis/${id}`);
    },
    [navigate]
  );

  const goToWords = useCallback(() => {
    navigate('/words');
  }, [navigate]);

  const goToWord = useCallback(
    (id: string) => {
      navigate(`/words/${id}`);
    },
    [navigate]
  );

  const goToSearch = useCallback(() => {
    navigate(`/search`);
  }, [navigate]);

  const goToUser = useCallback(
    (userId: string) => {
      navigate(`/user/${userId}`);
    },
    [navigate]
  );

  return { goToHome, goToKanjis, goToKanji, goToWords, goToWord, goToSearch, goToUser };
}
