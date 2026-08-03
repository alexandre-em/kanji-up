import { forwardRef, useImperativeHandle, useRef } from 'react';
import ViewShot from 'react-native-view-shot';

import Canvas from '../../../components/canvas';

export type WordSlotCanvasHandle = {
  capture: () => Promise<string>;
  getStrokesCount: () => number;
};

type WordSlotCanvasProps = {
  size: number;
};

const WordSlotCanvas = forwardRef<WordSlotCanvasHandle, WordSlotCanvasProps>(({ size }, ref) => {
  const viewShotRef = useRef<ViewShot>(null);
  const strokesCountRef = useRef(0);

  useImperativeHandle(ref, () => ({
    capture: () => (viewShotRef.current as unknown as { capture: () => Promise<string> }).capture(),
    getStrokesCount: () => strokesCountRef.current,
  }));

  return (
    <ViewShot ref={viewShotRef} style={{ width: size, height: size }} options={{ result: 'base64' }}>
      <Canvas width={size} height={size} strokeWidth={6} onStrokeUpdate={(count) => (strokesCountRef.current = count)} />
    </ViewShot>
  );
});

export default WordSlotCanvas;
