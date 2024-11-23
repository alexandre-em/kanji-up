import { Spacer, TypographyH3 } from 'gatewayApp/shared';
import { useNavigate } from 'react-router-dom';

type CategoryItemProps = {
  category: {
    grade: number;
    title: string;
    count: number;
    image: string[];
  };
};

export default function CategoryItem({ category }: CategoryItemProps) {
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer hover:bg-white transition duration-300 rounded-lg p-2"
      onClick={() => navigate(`/kanjis/category?grade=${category.grade}`)}
    >
      <TypographyH3>{category.title}</TypographyH3>
      <div className="flex justify-between">
        <img src={category.image[0]} loading="lazy" alt="img-1" className="w-full h-[105px] object-cover rounded-xl" />
        <Spacer size={0.5} direction="horizontal" />
        <div className="flex flex-col">
          <img
            src={category.image[1]}
            loading="lazy"
            alt="img-2"
            className="w-[200px] h-[50px] opacity-75 object-cover rounded-full"
          />
          <Spacer size={0.25} />
          <div className="relative flex flex-col justify-center items-center">
            <div className="absolute z-[1]">
              <div className="text-primary text-center font-black text-xl m-0">{category.count}</div>
              <div className="text-[#3f3d56] text-center m-0">characters</div>
            </div>
            <img
              src={category.image[2]}
              loading="lazy"
              alt="img-2"
              className="w-[200px] h-[50px] opacity-50 object-cover rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
