interface SvgProps {
  width: number,
  height: number,
};

interface ButtonProps {
  style?: any,
  titleStyle?: any,
  title: string,
  onPress?: function,
};

interface ChartProps {
  strokeWidth: number;
  radius: number;
  backgroundColor: string;
  percentageComplete: SkiaMutableValue<number>;
  targetPercentage: number;
};

interface GradientCardProps {
  title: string,
  subtitle: string,
  buttonTitle: string,
  image: any,
  onPress: function,
};

interface Pagination<T> {
  docs: Array<T>,
  totalDocs: number,
  limit: number,
  totalPages: number,
  page: number,
  pagingCounter: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  prevPage: number | null,
  nextPage: number | null,
}

