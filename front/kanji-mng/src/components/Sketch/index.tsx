import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import styles from './style';

const margin = 0.8;
const width = window.innerWidth;
const w = Math.min(width * margin, 500);

export interface SketchFunctions {
  strokeCount: number;
  getUri: () => string;
  toBlob: (callback: BlobCallback) => void;
  handleClear: () => void;
}

export default forwardRef(({ visible }: { visible: boolean }, ref) => {
  const divRef: React.MutableRefObject<HTMLDivElement | undefined>  = useRef();
  const [previousX, setPreviousX] = useState('');
  const [previousY, setPreviousY] = useState('');
  const [currentX, setCurrentX] = useState('');
  const [currentY, setCurrentY] = useState('');
  const [drawFlag, setDrawFlag] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const canvas = useRef<HTMLCanvasElement>();

  const handleClear = useCallback(() => {
    if (canvas?.current) {
      const ctx = canvas.current.getContext('2d');
      if (ctx) {
        canvas.current.width = w;
        canvas.current.height = w;
        ctx.strokeStyle = '#000';
        ctx.strokeRect(0, 0, w, w);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, w);
        
        ctx.lineWidth = 2;
        ctx.stroke();

        setIsOpen(true);
        setStrokeCount(0);
      }
    }
  }, [canvas]);

  const moveCursor = useCallback((nativeEvent: MouseEvent | TouchEvent) => {
    if (divRef && divRef.current){
      if ((nativeEvent as MouseEvent).offsetX) {
        setPreviousX(`${(nativeEvent as MouseEvent).offsetX}`);
        setPreviousY(`${(nativeEvent as MouseEvent).offsetY}`);
      } else {
        setPreviousX(`${(nativeEvent as TouchEvent).touches[0].pageX - divRef.current.offsetLeft}`);
        setPreviousY(`${(nativeEvent as TouchEvent).touches[0].pageY - divRef.current.offsetTop}`);
      }
    }
  }, [divRef]);

  const onMove = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!drawFlag) { return; }
    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();

        if (currentX !== ''){
          moveCursor(e.nativeEvent);
          ctx.moveTo(parseInt(previousX), parseInt(previousY));
        }

        ctx.lineTo(parseInt(currentX), parseInt(currentY));
        ctx.lineCap = 'round';
        ctx.lineWidth = 15;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.closePath();

        setCurrentX(previousX);
        setCurrentY(previousY);
      }
    }
  }, [canvas, currentX, currentY, drawFlag, moveCursor, previousX, previousY]);

  const onTouch = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setStrokeCount((prevState) => prevState + 1);
    setDrawFlag(true);
    moveCursor(e.nativeEvent);
  }, [moveCursor]);

  const onEnd = useCallback(() => {
    setDrawFlag(false);
    setPreviousX('');
    setPreviousY('');
    setCurrentX('');
    setCurrentY('');
  }, []);

  const canvasPlatformProps = {
    onMouseDown: onTouch,
    onMouseUp: onEnd,
    onMouseMove: onMove,
    onMouseLeave: onEnd,
    onTouchStart: onTouch,
    onTouchMove: onMove,
    onTouchEnd: onEnd,
    onTouchCancel: onEnd,
  };

  useImperativeHandle(ref, () => ({
    strokeCount,
    getUri: () => {
      if (canvas && canvas.current) {
        return canvas.current.toDataURL('image/jpeg', 1);
      } else { throw new Error('Could not save the canvas'); }
    },
    toBlob: (callback: BlobCallback) => {
      if (canvas && canvas.current) {
        canvas.current.toBlob(callback, 'image/jpeg', 1);
      } else { throw new Error('Could not save the canvas'); }
    },
    handleClear,
  }));

  useEffect(() => {
    if (visible && !isOpen) { handleClear(); }
    if (!visible) { setIsOpen(false); }
  }, [handleClear, isOpen, visible]);

  if (!visible) { return null; }
  return (
    <div ref={divRef as any} style={{ ...styles.canvas, ...({ width: w, height: w }) }} {...canvasPlatformProps} data-testid="sketch-canvas">
      <canvas ref={canvas as any} />
    </div>
  );
});
