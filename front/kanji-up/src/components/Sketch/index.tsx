import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { Surface } from 'react-native-paper';

import {colors} from '../../constants';
import CanvasPlatform from './Canvas';
import styles from './style';

const color = colors.text;
const margin = 0.8;

const { width } = Dimensions.get('window');
const w = Math.min(width * margin, 500);

export default forwardRef(({ visible }: SketchProps, ref) => {
  const divRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef();
  const [previousX, setPreviousX] = useState('');
  const [previousY, setPreviousY] = useState('');
  const [currentX, setCurrentX] = useState('');
  const [currentY, setCurrentY] = useState('');
  const [drawFlag, setDrawFlag] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const canvas = useRef<HTMLCanvasElement>();
  const isWeb = Platform.OS === 'web';

  const handleClear = useCallback(() => {
    if (canvas?.current) {
      const ctx = canvas.current.getContext('2d');
      if (ctx) {
        canvas.current.width = w;
        canvas.current.height = w;
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(0, 0, w, w);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, w);
        
        ctx.lineWidth = 2;
        ctx.stroke();

        setIsOpen(true);
        setStrokeCount(0);
      }
    }
  }, [canvas]);

  const moveCursor = useCallback((nativeEvent: any) => {
    if (isWeb) {
      if (divRef && divRef.current) {
        if (nativeEvent.offsetX) {
          setPreviousX(nativeEvent.offsetX);
          setPreviousY(nativeEvent.offsetY);
        } else {
          setPreviousX(`${nativeEvent.touches[0].clientX - divRef.current.offsetLeft - 20}`);
          setPreviousY(`${nativeEvent.touches[0].clientY - divRef.current.offsetTop - 56}`);
        }
      }
    } else {
      setPreviousX(nativeEvent.locationX);
      setPreviousY(nativeEvent.locationY);
    }
  }, [isWeb, divRef]);

  const onMove = useCallback((e: any) => {
    if (!drawFlag) { return; }
    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();

        if (currentX === '') {
          setPreviousX(previousX);
          setPreviousY(previousY);
        } else {
          moveCursor(e.nativeEvent);
          ctx.moveTo(parseInt(previousX), parseInt(previousY));
        }

        ctx.lineTo(parseInt(currentX), parseInt(currentY));
        ctx.lineCap = 'round';
        ctx.lineWidth = 15;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();

        setCurrentX(previousX);
        setCurrentY(previousY);
      }
    }
  }, [canvas, currentX, currentY, drawFlag, moveCursor, previousX, previousY]);

  const onTouch = useCallback((e: any) => {
    setStrokeCount((prevState) => prevState + 1);
    setDrawFlag(true);
    moveCursor(e.nativeEvent);
  }, [moveCursor]);

  const onTouchEnd = useCallback(() => {
    setDrawFlag(false);
    setPreviousX('');
    setPreviousY('');
    setCurrentX('');
    setCurrentY('');
  }, []);

  const canvasPlatformProps = {
    onMouseDown: onTouch,
    onMouseUp: onTouchEnd,
    onMouseMove: onMove,
    onMouseLeave: onTouchEnd,
    onTouchStart: onTouch,
    onTouchMove: onMove,
    onTouchEnd: onTouchEnd,
    onTouchCancel: onTouchEnd,
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
    <View ref={divRef as any} style={styles.body}>
      <Surface elevation={4}>
        <View style={[styles.canvas, { width: w, height: w }]} {...canvasPlatformProps}>
          <CanvasPlatform ref={canvas} />
        </View>
      </Surface>
    </View>
  );
});
