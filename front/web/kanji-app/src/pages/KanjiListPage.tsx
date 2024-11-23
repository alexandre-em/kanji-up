import {
  KANJI_PROGRESSION_MAX,
  Loading,
  PageLayout,
  Spacer,
  TypographyH2,
  TypographyH3,
  useKanji,
  useKanjiSelection,
  useSession,
  useUserScore,
} from 'gatewayApp/shared';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, SquareDashedMousePointer } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';

const GRADE_KEY = 'grade';
const PAGE_KEY = 'page';
const LIMIT_KEY = 'limit';

const LIMIT = '10';
const PAGE = '1';

export default function KanjiListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const grade = searchParams.get(GRADE_KEY);
  const page = parseInt(searchParams.get(PAGE_KEY) || PAGE);
  const limit = parseInt(searchParams.get(LIMIT_KEY) || LIMIT);

  const { kanjis, getAll, kanjisStatus } = useKanji();
  const { selectedKanji, initialize } = useKanjiSelection();
  const { sub } = useSession();
  const { kanji, getKanji } = useUserScore();

  console.log(selectedKanji);

  const handleClickKanji = useCallback(() => {
    // TODO: code this function
  }, []);

  const handleSelectionClick = useCallback(() => {
    if (isSelectionMode) {
      toast({ description: 'Selection saved successfully', title: 'Success', variant: 'success' });
    }
    setIsSelectionMode((prev) => !prev);
  }, [isSelectionMode]);

  const handleNavigatePage = useCallback(
    (p = page, l = limit) => {
      if (limit === l && kanjis && (p >= kanjis.totalPages || p <= 0)) return;
      navigate(`/kanjis/category?page=${p}&limit=${l}&grade=${grade}`);
    },
    [page, limit, grade]
  );

  useEffect(() => {
    if (grade) {
      initialize();
      getAll(grade, limit, page);
      if (sub) getKanji(sub);
    }
  }, [grade, page, limit, sub]);

  if (kanjisStatus === 'failed') return <div>An error occurred</div>;
  if (kanjisStatus === 'pending' || kanjisStatus === 'idle') return <Loading />;

  return (
    <PageLayout
      header={{
        title: `Kanji list for grade ${grade}`,
        subtitle: 'The 13K differents characters are sorted by difficulties and in order of learning for students in japan',
      }}
    >
      <Spacer size={1} />
      <div className="w-full flex flex-wrap justify-between items-center">
        <TypographyH2>
          Results : {page * limit} of {kanjis?.totalDocs || 0}
        </TypographyH2>
        <div className="flex">
          <Button size="icon" onClick={handleSelectionClick} variant={isSelectionMode ? 'outline' : 'default'}>
            {!isSelectionMode ? <SquareDashedMousePointer /> : <Check />}
          </Button>
          <Spacer size={1} direction="horizontal" />
          <Select onValueChange={(val) => handleNavigatePage(1, parseInt(val))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Spacer size={1} />
      <div className="flex flex-wrap justify-center">
        {kanjis!.docs.map((k) => (
          <div key={k.kanji_id} className="flex flex-col items-center justify-center">
            <Card className="w-[60px] h-[60px] flex justify-center items-center m-2">
              <TypographyH3>
                <span className="text-2xl">{k.kanji.character}</span>
              </TypographyH3>
            </Card>
            {kanji.progression[k.kanji_id] !== undefined && (
              <Progress value={(kanji.progression[k.kanji_id] / KANJI_PROGRESSION_MAX) * 100} className="w-[60px] h-[5px]" />
            )}
          </div>
        ))}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => handleNavigatePage(page - 1)} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink onClick={() => handleNavigatePage(1)}>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          {kanjis?.totalPages !== 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => handleNavigatePage(kanjis?.totalPages)}>{kanjis?.totalPages}</PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext onClick={() => handleNavigatePage(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </PageLayout>
  );
}
