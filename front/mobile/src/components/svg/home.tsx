import Svg, { Path } from 'react-native-svg';

type HomeProps = {
  size: number;
  color: string;
};

export default function Home({ size, color }: HomeProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 10.2 12 3.5l8.5 6.7V20a1 1 0 0 1-1 1h-4.75v-6.25h-5.5V21H4.5a1 1 0 0 1-1-1v-9.8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
