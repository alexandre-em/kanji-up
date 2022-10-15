import React, {useRef} from 'react';
import {SafeAreaView, Text} from 'react-native';

import styles from './style';
import {FlashcardProps} from '../../types/screens';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import Sketch from '../../components/Sketch';

export default function Flashcard({ navigation, route }: FlashcardProps) {
  const kanji =  useSelector((state: RootState) => state.kanji);
  const canvasRef = useRef(null);

  return (<SafeAreaView style={styles.main}>
    <Text>Test</Text>
    <Sketch visible ref={canvasRef} />

  </SafeAreaView>)
};

