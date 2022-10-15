import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { Button, Surface } from 'react-native-paper';

import colors from '../../constants/colors';
import CanvasPlatform from './Canvas';
import styles from './style';

const color = colors.text;
const margin = 0.8;

const { width } = Dimensions.get('window');
const w = Math.min(width * margin, 500);

export default forwardRef(({ visible }: { visible: boolean }, ref) => {
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
        ctx.strokeStyle = '#e0e0e055';
        ctx.moveTo(0, w/2);
        ctx.lineTo(w, w/2);
        ctx.moveTo(w/2, 0);
        ctx.lineTo(w/2, w);
        ctx.stroke();

        setIsOpen(true);
        setStrokeCount(0);
      }
    }
  }, [canvas]);

  useEffect(() => {
    if (visible && !isOpen) { handleClear(); }
    if (!visible) { setIsOpen(false); }
  }, [handleClear, isOpen, visible]);

  const moveCursor = useCallback((nativeEvent) => {
    if (isWeb) {
      if (nativeEvent.offsetX) {
        setPreviousX(nativeEvent.offsetX);
        setPreviousY(nativeEvent.offsetY);
      } else {
        setPreviousX(nativeEvent.touches[0].pageX);
        setPreviousY(nativeEvent.touches[0].pageY);
      }
    } else {
      setPreviousX(nativeEvent.locationX);
      setPreviousY(nativeEvent.locationY);
    }
  }, [isWeb]);

  const onMove = useCallback((e) => {
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
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();

        setCurrentX(previousX);
        setCurrentY(previousY);
      }
    }
  }, [canvas, currentX, currentY, drawFlag, moveCursor, previousX, previousY]);

  const onTouch = useCallback((e) => {
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
    onTouchStart: onTouch,
    onTouchMove: onMove,
    onTouchEnd: onTouchEnd,
  };

  useImperativeHandle(ref, () => ({
    strokeCount,
    getUri: () => {
      if (canvas && canvas.current) {
        return canvas.current.toDataURL();
      } else { throw new Error('Could not save the canvas'); }
    },
    handleClear,
  }));


  if (!visible) { return null; }

  return (
    <View style={styles.body}>
      <Surface>
        <View style={[styles.canvas, { width: w, height: w }]} {...canvasPlatformProps} elevation={4}>
          <CanvasPlatform ref={canvas} />
        </View>
      </Surface>
    </View>
  );
});

