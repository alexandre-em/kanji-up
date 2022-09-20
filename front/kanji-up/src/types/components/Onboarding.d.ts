type OnboardingItem = {
  title: string,
  description: string,
  id: string,
  image: any,
};

type OnboardingItemProps = {
  item: OnboardingItem,
}

type PaginatorProps = {
  data: OnboardingItem[],
  scrollX: Animated.Value,
}

