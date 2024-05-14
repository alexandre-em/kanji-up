import { Stack } from 'expo-router';
import React from 'react';

import { GameProvider } from '../../providers';

export default function GameLayout() {
  return (
    <GameProvider>
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </GameProvider>
  );
}
