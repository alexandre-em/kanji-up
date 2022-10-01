type SvgProps = {
  width: number,
  height: number,
};

type ButtonProps = {
  style?: any,
  titleStyle?: any,
  title: string,
  onPress?: function,
};

type ChartProps = {
  strokeWidth: number;
  radius: number;
  backgroundColor: string;
  percentageComplete: SkiaMutableValue<number>;
  targetPercentage: number;
};

type GradientCardProps = {
  title: string,
  subtitle: string,
  buttonTitle: string,
  image: any,
  onPress: function,
};

