import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { Assets, Colors, Icon } from 'react-native-ui-lib';

import { useDraggableSlotRowStyles } from '../hooks/useDraggableSlotRowStyles';
import DraggableSlot, { BADGE_OVERFLOW, DraggableSlotItem } from './draggableSlot';

const GAP = 12;
const AUTO_SCROLL_EDGE = 60;
const AUTO_SCROLL_SPEED = 8;

type DraggableSlotRowProps<T extends DraggableSlotItem> = {
  slots: T[];
  slotSize: number;
  onReorder: (slots: T[]) => void;
  onSlotPress: (id: number) => void;
  onAddSlot: () => void;
  addSlotAccessibilityLabel: string;
  slotAccessibilityLabel: string;
  slotAccessibilityHint: string;
};

export default function DraggableSlotRow<T extends DraggableSlotItem>({
  slots,
  slotSize,
  onReorder,
  onSlotPress,
  onAddSlot,
  addSlotAccessibilityLabel,
  slotAccessibilityLabel,
  slotAccessibilityHint,
}: DraggableSlotRowProps<T>) {
  const styles = useDraggableSlotRowStyles();

  const pitch = slotSize + GAP;
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const order = useSharedValue<number[]>(slots.map((slot) => slot.id));
  const activeId = useSharedValue<number | null>(null);
  const dragContentX = useSharedValue(0);

  // Re-syncs whenever a slot is added/removed/edited elsewhere (not from a drag committed here,
  // which already leaves `order` matching `slots`) — safe to run unconditionally either way
  const slotIdsKey = slots.map((slot) => slot.id).join(',');
  useEffect(() => {
    order.value = slots.map((slot) => slot.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  useFrameCallback(() => {
    if (activeId.value === null) return;

    const visibleStart = scrollX.value;
    const visibleEnd = scrollX.value + containerWidth.value;

    let delta = 0;
    if (dragContentX.value < visibleStart + AUTO_SCROLL_EDGE) delta = -AUTO_SCROLL_SPEED;
    else if (dragContentX.value > visibleEnd - AUTO_SCROLL_EDGE) delta = AUTO_SCROLL_SPEED;

    if (delta === 0) return;

    const totalContentWidth = order.value.length * pitch + slotSize;
    const maxScroll = Math.max(0, totalContentWidth - containerWidth.value);
    const next = Math.min(maxScroll, Math.max(0, scrollX.value + delta));
    if (next === scrollX.value) return;

    scrollX.value = next;
    scrollTo(scrollRef, next, 0, false);
  });

  const byId = new Map(slots.map((slot) => [slot.id, slot]));
  const handleDrop = (newOrder: number[]) => {
    onReorder(newOrder.map((id) => byId.get(id)!));
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, { height: slotSize + BADGE_OVERFLOW + 16 }]}
      contentContainerStyle={[styles.content, { width: slots.length * pitch + slotSize, height: slotSize + BADGE_OVERFLOW + 8 }]}
      onLayout={(event) => {
        containerWidth.value = event.nativeEvent.layout.width;
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}>
      {slots.map((slot, index) => (
        <DraggableSlot
          key={slot.id}
          slot={slot}
          index={index}
          slotSize={slotSize}
          pitch={pitch}
          order={order}
          activeId={activeId}
          dragContentX={dragContentX}
          scrollX={scrollX}
          styles={styles}
          onPress={() => onSlotPress(slot.id)}
          onDrop={handleDrop}
          accessibilityLabel={slotAccessibilityLabel}
          accessibilityHint={slotAccessibilityHint}
        />
      ))}
      <TouchableOpacity
        style={[styles.addSlot, { width: slotSize, height: slotSize, top: BADGE_OVERFLOW, left: slots.length * pitch }]}
        onPress={onAddSlot}
        accessibilityRole="button"
        accessibilityLabel={addSlotAccessibilityLabel}>
        <Icon source={Assets.icons.add} size={28} tintColor={Colors.$iconPrimary} />
      </TouchableOpacity>
    </Animated.ScrollView>
  );
}
