import React from 'react';
import { GameProvider } from 'providers';
import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <GameProvider>
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </GameProvider>
  );
}
