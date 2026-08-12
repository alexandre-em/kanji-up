import { Image, ImageStyle, View as RNView, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from 'react-native-ui-lib';

export type DraggableSlotItem = {
  id: number;
  image: string;
};

const LONG_PRESS_DURATION = 350;

// The order badge pokes above and to the right of the tile (top: -8, right: -8 in its own style)
// — this is how much extra room the row container must reserve above/right of every tile so it
// doesn't get clipped
export const BADGE_OVERFLOW = 8;

type DraggableSlotStyles = {
  slotWrapper: ViewStyle;
  slot: ViewStyle;
  slotImage: ImageStyle;
  slotBadge: ViewStyle;
};

type DraggableSlotProps = {
  slot: DraggableSlotItem;
  /** The item's position in the last committed (React state) order — used only for the badge
   * number, which intentionally does not animate live during a drag; the geometry below reads
   * `order` directly for that */
  index: number;
  slotSize: number;
  pitch: number;
  order: SharedValue<number[]>;
  activeId: SharedValue<number | null>;
  dragContentX: SharedValue<number>;
  scrollX: SharedValue<number>;
  styles: DraggableSlotStyles;
  onPress: () => void;
  onDrop: (order: number[]) => void;
  accessibilityLabel: string;
  accessibilityHint: string;
};

export default function DraggableSlot({
  slot,
  index,
  slotSize,
  pitch,
  order,
  activeId,
  dragContentX,
  scrollX,
  styles,
  onPress,
  onDrop,
  accessibilityLabel,
  accessibilityHint,
}: DraggableSlotProps) {
  const dragStartOrderIndex = useSharedValue(index);
  const dragStartScrollX = useSharedValue(0);
  // Flips true once the long-press has actually fired — gates the pan gesture below, so a plain
  // swipe never claims the touch from the row's own horizontal scroll
  const isPressed = useSharedValue(false);

  const longPress = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onStart(() => {
      isPressed.value = true;
      activeId.value = slot.id;
      dragStartOrderIndex.value = order.value.indexOf(slot.id);
      dragStartScrollX.value = scrollX.value;
      dragContentX.value = dragStartOrderIndex.value * pitch;
    });

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_event, stateManager) => {
      if (isPressed.value) stateManager.activate();
      else stateManager.fail();
    })
    .onUpdate((event) => {
      if (activeId.value !== slot.id) return;

      // translationX is the raw finger delta; the scrollX term compensates for whatever the
      // auto-scroll frame callback has shifted the content by since the drag started, so the
      // item stays under the finger even while the row scrolls underneath it
      const contentX = dragStartOrderIndex.value * pitch + event.translationX + (scrollX.value - dragStartScrollX.value);
      dragContentX.value = contentX;

      const targetIndex = Math.max(0, Math.min(order.value.length - 1, Math.round(contentX / pitch)));
      const currentIndex = order.value.indexOf(slot.id);
      if (targetIndex !== currentIndex) {
        const next = [...order.value];
        next.splice(currentIndex, 1);
        next.splice(targetIndex, 0, slot.id);
        order.value = next;
      }
    })
    .onEnd(() => {
      if (activeId.value !== slot.id) return;
      runOnJS(onDrop)(order.value);
    })
    .onFinalize(() => {
      isPressed.value = false;
      if (activeId.value === slot.id) activeId.value = null;
    });

  const tap = Gesture.Tap().onEnd(() => {
    if (!isPressed.value) runOnJS(onPress)();
  });

  const composed = Gesture.Simultaneous(longPress, pan, tap);

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === slot.id;
    const currentIndex = order.value.indexOf(slot.id);

    return {
      transform: [
        { translateX: isActive ? dragContentX.value : withSpring(currentIndex * pitch) },
        { scale: isActive ? withTiming(1.05) : withTiming(1) },
      ],
      zIndex: isActive ? 10 : 1,
      elevation: isActive ? 8 : 2,
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          styles.slotWrapper,
          { position: 'absolute', top: BADGE_OVERFLOW, width: slotSize, height: slotSize },
          animatedStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}>
        <RNView style={[styles.slot, { width: slotSize, height: slotSize }]}>
          <Image
            source={{ uri: `data:image/png;base64,${slot.image}` }}
            style={[styles.slotImage, { width: slotSize, height: slotSize }]}
          />
        </RNView>
        <RNView style={styles.slotBadge}>
          <Text text100BO white>
            {index + 1}
          </Text>
        </RNView>
      </Animated.View>
    </GestureDetector>
  );
}
