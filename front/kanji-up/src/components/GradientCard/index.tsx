import React from 'react';
import {ImageBackground, Platform, Text, View} from "react-native";
import {Button} from "react-native-paper";
import {LinearGradient} from "expo-linear-gradient";

import styles from './style';

export default function GradientCard({ buttonTitle, image, onPress, title, subtitle }: GradientCardProps) {
  const Gradient = Platform.select({ web: View, native: LinearGradient });
  const webGradient = Platform.OS === 'web' ? [{background: 'linear-gradient(200deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 85%)'}] : [];
  const gradientColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'];

  return (
    <View style={styles.card}>
      <ImageBackground
        source={image}
        style={{ flex: 1 }}
        imageStyle={{ borderRadius: 15, opacity: 0.65 }}
        resizeMode="cover"
      >
        <Gradient style={[styles.gradient, ...webGradient]} colors={gradientColors} end={{ x: 0.2, y: 0.8 }}>
          <View style={styles.content}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Button
              mode="contained"
              onPress={onPress}
              icon="cards-playing-heart-multiple"
              style={{ borderRadius: 25, width: '90%' }}
            >
              {buttonTitle}
            </Button>
          </View>
        </Gradient>
      </ImageBackground>
    </View>
  )
};
