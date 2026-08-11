import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ViewShot from 'react-native-view-shot';

import Canvas from '../../../components/canvas';

export type WordSlotCanvasHandle = {
  capture: () => Promise<string>;
  getStrokesCount: () => number;
  clear: () => void;
};

type WordSlotCanvasProps = {
  size: number;
};

const WordSlotCanvas = forwardRef<WordSlotCanvasHandle, WordSlotCanvasProps>(({ size }, ref) => {
  const viewShotRef = useRef<ViewShot>(null);
  const canvasRef = useRef(null);
  const strokesCountRef = useRef(0);
  // Forcing the canvas to its white/black capture colors is a state change, so it needs a render
  // to actually commit before the snapshot is taken — see the effect below
  const [isCapturing, setIsCapturing] = useState(false);
  const captureResolveRef = useRef<((uri: string) => void) | null>(null);

  useEffect(() => {
    if (!isCapturing) return;

    // React commits the forced white/black capture colors instantly, but the native view needs a
    // moment to actually repaint before a snapshot reflects it, or capture() catches a stale frame
    const timeout = setTimeout(() => {
      (viewShotRef.current as unknown as { capture: () => Promise<string> })
        .capture()
        .then((uri) => captureResolveRef.current?.(uri))
        .finally(() => setIsCapturing(false));
    }, 200);

    return () => clearTimeout(timeout);
  }, [isCapturing]);

  useImperativeHandle(ref, () => ({
    capture: () =>
      new Promise<string>((resolve) => {
        captureResolveRef.current = resolve;
        setIsCapturing(true);
      }),
    getStrokesCount: () => strokesCountRef.current,
    clear: () => (canvasRef.current as unknown as { clear: () => void } | null)?.clear(),
  }));

  return (
    <ViewShot ref={viewShotRef} style={{ width: size, height: size }} options={{ result: 'base64' }}>
      <Canvas
        ref={canvasRef}
        width={size}
        height={size}
        strokeWidth={6}
        forceCaptureColors={isCapturing}
        onStrokeUpdate={(count) => (strokesCountRef.current = count)}
      />
    </ViewShot>
  );
});

export default WordSlotCanvas;
