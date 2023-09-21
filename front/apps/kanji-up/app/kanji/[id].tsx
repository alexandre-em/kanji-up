import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Chip, DataTable, Divider, List, Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import styles from './style';
import { colors } from 'constants/Colors';
import { SVGUriPlatform } from 'kanji-app-svg-ui';
import { KanjiType } from 'kanji-app-types';
import { error, kanji } from 'store/slices';
import { RootState } from 'store';
import global from 'styles/global';
import core from 'kanji-app-core';
import { router, useGlobalSearchParams } from 'expo-router';
import { KANJI_PROGRESSION_MAX } from 'constants';

export default function KanjiDetail() {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const userState = useSelector((state: RootState) => state.user);
  const imgSize = width < 700 ? width * 0.5 : 250;
  const { id, access_token } = useGlobalSearchParams();
  const [details, setDetails] = useState<KanjiType | null>(null);

  const isSelected = useMemo(
    () => (kanjiState.selectedKanji[id as string] && !kanjiState.toRemove[id as string]) || kanjiState.toAdd[id as string],
    [kanjiState]
  );

  const handlePress = useCallback(() => {
    if (details) {
      if (isSelected) {
        dispatch(kanji.actions.unSelectKanji(details));
      } else {
        dispatch(kanji.actions.selectKanji(details));
      }
    }
  }, [isSelected, details]);

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();

    if (id && core && core.kanjiService) {
      core.kanjiService
        .getOne({ id: id as string }, { cancelToken: cancelToken.token })
        .then((res) => setDetails(res.data))
        .catch((err) =>
          dispatch(error.actions.update({ message: axios.isCancel(err) ? 'Previous action cancelled.' : err.message }))
        );
    }

    return () => {
      cancelToken.cancel();
    };
  }, [id]);

  if (!details) {
    return (
      <View style={[global.main, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating />
      </View>
    );
  }

  return (
    <View style={global.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={`Detail of ${details.kanji.character} ${userState.progression[details.kanji_id] !== undefined
              ? `(${Math.min((userState.progression[details.kanji_id] / KANJI_PROGRESSION_MAX) * 100, 100)}%)`
              : ''
            }`}
          titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }}
        />
      </Appbar.Header>
      <ScrollView>
        <View style={styles.content}>
          <Surface elevation={4} style={{ marginRight: 12, position: 'relative' }}>
            <View
              style={{ borderColor: '#e0e0e0', borderRightWidth: 1, position: 'absolute', width: '50%', height: '100%' }}></View>
            <View
              style={{ borderColor: '#e0e0e0', borderBottomWidth: 1, position: 'absolute', width: '100%', height: '50%' }}></View>
            <SVGUriPlatform
              width={imgSize}
              height={imgSize}
              uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(details.kanji.character as string)}`}
            />
          </Surface>
          <View style={{ width: (width < 700 ? width : 680) - imgSize }}>
            <Text style={global.title}>Onyomi</Text>
            <View style={styles.tags}>
              {(details.kanji.onyomi || [])
                .join('|')
                .split(/,|\||、/)
                .map((k) => (
                  <Chip key={`on-${k}`} textStyle={{ color: '#fff' }} style={styles.tag}>
                    {k}
                  </Chip>
                ))}
            </View>
            <Text style={global.title}>Kunyomi</Text>
            <View style={styles.tags}>
              {(details.kanji.kunyomi || [])
                .join('|')
                .split(/,|\||、/)
                .map((k) => (
                  <Chip key={`kun-${k}`} textStyle={{ color: '#fff' }} style={styles.tag}>
                    {k}
                  </Chip>
                ))}
            </View>
          </View>
        </View>
        {!access_token && (
          <Button mode={isSelected ? 'outlined' : 'contained'} onPress={handlePress} style={styles.button}>
            {isSelected ? 'Unselect' : 'Select'}
          </Button>
        )}
        <View style={styles.details}>
          <List.Accordion title="Details" description="number of stroke, meanings, etc." style={{ backgroundColor: '#f8f8f8' }}>
            <DataTable.Row>
              <DataTable.Cell>id</DataTable.Cell>
              <DataTable.Cell style={{ opacity: 0.5 }}>{details.kanji_id}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>stroke</DataTable.Cell>
              <DataTable.Cell style={{ opacity: 0.5 }}>{details.kanji.strokes}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>on</DataTable.Cell>
              <DataTable.Cell style={{ opacity: 0.5 }}>{details.kanji.onyomi}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>kun</DataTable.Cell>
              <DataTable.Cell style={{ opacity: 0.5 }}>{details.kanji.kunyomi}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>meanings</DataTable.Cell>
              <DataTable.Cell style={{ opacity: 0.5 }}>{details.kanji.meaning}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Grade</DataTable.Cell>
              <DataTable.Cell style={{ opacity: 0.5 }}>{details.reference?.grade || '/'}</DataTable.Cell>
            </DataTable.Row>
          </List.Accordion>
        </View>
        {details.radical && (
          <View style={styles.details}>
            <Divider />
            <List.Accordion
              title="Radical"
              description="character, number of strokes, name, etc."
              style={{ backgroundColor: '#f8f8f8' }}>
              <DataTable.Row>
                <DataTable.Cell>id</DataTable.Cell>
                <DataTable.Cell style={{ opacity: 0.5 }}>{details.radical.radical_id}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>character</DataTable.Cell>
                <DataTable.Cell style={{ opacity: 0.5 }}>{details.radical.character}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>stroke</DataTable.Cell>
                <DataTable.Cell style={{ opacity: 0.5 }}>{details.radical.strokes}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>hiragana</DataTable.Cell>
                <DataTable.Cell style={{ opacity: 0.5 }}>{details.radical.name?.hiragana || '/'}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>romaji</DataTable.Cell>
                <DataTable.Cell style={{ opacity: 0.5 }}>{details.radical.name?.romaji || '/'}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>meanings</DataTable.Cell>
                <DataTable.Cell style={{ opacity: 0.5 }}>{details.radical.meaning}</DataTable.Cell>
              </DataTable.Row>
            </List.Accordion>
          </View>
        )}
        {details.examples && (
          <View style={styles.details}>
            <Divider />
            <List.Accordion
              title="Examples"
              description={`Sentences/Words using the "${details.kanji.character}" character`}
              style={{ backgroundColor: '#f8f8f8' }}>
              {details.examples.map(({ japanese, meaning }) => {
                return (
                  <View key={japanese}>
                    <View style={{ margin: 10 }}>
                      <Text style={{ color: colors.text }}>{japanese}</Text>
                      <Text style={{ color: colors.text, opacity: 0.5 }}>{meaning}</Text>
                    </View>
                    <Divider />
                  </View>
                );
              })}
            </List.Accordion>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
