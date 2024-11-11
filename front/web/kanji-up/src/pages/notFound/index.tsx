import BottomNavBar from '@/components/BottomNavBar';
import NotFoundSvg from '@/components/svg/notFound';
import { PageLayout, TypographyH1 } from '@/shared';

export default function NotFoundPage() {
  return (
    <div className="flex justify-center w-full">
      <PageLayout>
        <div className="h-full flex flex-col items-center justify-center">
          <NotFoundSvg width={350} height={200} />
          <div className="flex items-center mt-1">
            <TypographyH1>Page Not found</TypographyH1>
          </div>
        </div>
      </PageLayout>
      <BottomNavBar />
    </div>
  );
}
