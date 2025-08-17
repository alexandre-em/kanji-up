import { DOMParser } from '@xmldom/xmldom';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { ClipPath, Defs, Path } from 'react-native-svg';

type StrokePath = {
  d: string;
  clipPath: string;
  delay: number;
};

type ExtractedPaths = {
  basePaths: { id: string; d: string }[];
  strokePaths: StrokePath[];
};

function cleanSvgString(svg: string): string {
  return svg.replace(/<!--[\s\S]*?-->/g, '').trim();
}

export function extractStrokePaths(svgString: string): ExtractedPaths {
  if (!svgString || svgString.length === 0) return { basePaths: [], strokePaths: [] };
  const parser = new DOMParser();
  const cleaned = cleanSvgString(svgString);
  const doc = parser.parseFromString(cleaned, 'image/svg+xml');

  if (!doc || !doc.documentElement) {
    throw new Error('Invalid SVG input: missing root element');
  }

  const basePaths: { id: string; d: string }[] = [];
  const strokePaths: StrokePath[] = [];

  const pathElements = Array.from(doc.getElementsByTagName('path'));

  pathElements.forEach((el) => {
    const id = el.getAttribute('id');
    const d = el.getAttribute('d');
    const clipPath = el.getAttribute('clip-path');
    const style = el.getAttribute('style');

    if (!d) return;

    // Gray background paths
    if (id && !clipPath) {
      basePaths.push({ id, d });
    }

    // Stroke animation paths
    if (clipPath) {
      let delay = 0;
      if (style) {
        const match = style.match(/--d:([\d.]+)s/);
        if (match) delay = parseFloat(match[1]);
      }
      strokePaths.push({
        d,
        clipPath: clipPath.replace('url(#', '').replace(')', ''),
        delay,
      });
    }
  });

  return { basePaths, strokePaths };
}

type AnimatedSvgRendererProps = {
  svgString: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  loop?: boolean;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedSvgRenderer: React.FC<AnimatedSvgRendererProps> = ({
  svgString,
  width = 300,
  height = 300,
  strokeColor = 'black',
  strokeWidth = 25,
  loop = false,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const { basePaths, strokePaths } = extractStrokePaths(svgString);

  useEffect(() => {
    if (strokePaths.length === 0) return;

    const animations = strokePaths.map((p, index) =>
      Animated.timing(progress, {
        toValue: index + 1,
        duration: 1000,
        delay: p.delay,
        easing: Easing.exp,
        useNativeDriver: true,
      }),
    );

    const sequence = Animated.sequence(animations);

    if (loop) {
      Animated.loop(sequence).start();
    } else {
      sequence.start();
    }
  }, [strokePaths, loop, progress]);

  if (!svgString || svgString.length === 0) return null;
  if (strokePaths.length === 0) return null;

  return (
    <Svg width={width} height={height} viewBox="0 0 1024 1024">
      <Defs>
        {basePaths.map((bp) => (
          <ClipPath key={bp.id} id={bp.id}>
            <Path d={bp.d} />
          </ClipPath>
        ))}
      </Defs>

      {basePaths.map((bp) => (
        <Path key={`fill-${bp.id}`} d={bp.d} fill="#ccc" />
      ))}

      {strokePaths.map((sp, i) => (
        <AnimatedPath
          key={`stroke-${i}`}
          d={sp.d}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[3333]}
          strokeDashoffset={progress.interpolate({
            inputRange: [i, i + 1],
            outputRange: [3333, 0],
            extrapolate: 'clamp',
          })}
          clipPath={`url(#${sp.clipPath})`}
          fill="none"
        />
      ))}
    </Svg>
  );
};

export default AnimatedSvgRenderer;
