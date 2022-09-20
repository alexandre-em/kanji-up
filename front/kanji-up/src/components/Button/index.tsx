import React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import themeColors from "../../constants/colors";

export default function Button({ colors = [themeColors.primary, 'black'], style, titleStyle, title, onPress } : ButtonProps) {
  return (
    <LinearGradient
      colors={colors}
      style={[buttonStyle.container, style]}
      start={{ x: 0.9, y: 0.3 }}
      {...(Platform.select({ web: { onClick: onPress }, native: { onPress } }))}
    >
      <Text style={[buttonStyle.title, titleStyle]}>{title}</Text>
    </LinearGradient>
  )
};

const buttonStyle = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 5,
    width: '100%',
    margin: 20,
  },
  title: {
    fontWeight: '700',
    color: themeColors.background,
    backgroundColor: 'transparent',
  }
})

