// Kept tight on purpose — a generous free cap would leave premium's "unlimited lists" perk
// pointless. See CLAUDE.md decisions for the reasoning.
export const MAX_FREE_LISTS = 3;

export function canCreateList(currentListCount: number, subscriptionPlan: SubscriptionPlan): boolean {
  if (subscriptionPlan === 'premium') return true;
  return currentListCount < MAX_FREE_LISTS;
}

// No backend involved for lists (local-only entity), so ids are generated client-side —
// timestamp plus a random suffix is enough entropy for something never sent over the network
// or compared across devices.
export function generateListId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
