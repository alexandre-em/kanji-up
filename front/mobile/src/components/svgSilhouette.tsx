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

const SvgSilhouette: React.FC<AnimatedSvgRendererProps> = ({ svgString, width = 300, height = 300 }) => {
  const { basePaths, strokePaths } = extractStrokePaths(svgString);

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
    </Svg>
  );
};

export default SvgSilhouette;
