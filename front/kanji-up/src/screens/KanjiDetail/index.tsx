import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, useWindowDimensions, View} from 'react-native';
import {Appbar, Button, Chip, DataTable, Divider, List} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';

import styles from './style';
import {kanjiService} from '../../service';
import SvgUriPlatform from '../../components/SVGUriPlatform';
import {KanjiDetailProps} from '../../types/screens';
import colors from '../../constants/colors';
import {error, kanji} from '../../store/slices';
import {RootState} from '../../store';

export default function KanjiDetail({ navigation, route }: KanjiDetailProps) {
  const { width } = useWindowDimensions()
  const dispatch = useDispatch();
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const imgSize = width < 700 ? width * 0.5 : 250;
  const { id } = route.params;
  const [details, setDetails] = useState<KanjiType | null>(null);

  const handlePress = useCallback(() => {
    if (details) {
      if (kanjiState.toAdd[details.kanji_id] || (kanjiState.selectedKanji[details.kanji_id] && !kanjiState.toRemove[details.kanji_id])) {
        dispatch(kanji.actions.unSelectKanji(details));
      } else {
        dispatch(kanji.actions.selectKanji(details));
      }
    }
  }, [kanjiState, details]);

  const isSelected = useMemo(() => (
    kanjiState.selectedKanji[id] || kanjiState.toAdd[id]
  ),[kanjiState])

  useEffect(() => {
    if (id) {
      kanjiService
        .getKanjiDetail({ id })
        .then((res) => setDetails(res.data))
        .catch((err) => dispatch(error.actions.update(err.message)));

    }
  }, [id]);

  if (!details) {
    return <ActivityIndicator animating />;
  }

  return (
    <View style={styles.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Detail of ${details.kanji.character}`} titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      </Appbar.Header>
      <ScrollView>
        <View style={styles.content}>
          <SvgUriPlatform width={imgSize} height={imgSize} uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(details.kanji.character as string)}`} />
          <View style={{ width: (width < 700 ? width : 680) - imgSize }}>
            <Text style={styles.title}>Onyomi</Text>
            <View style={styles.tags}>
              {(details.kanji.onyomi || [])
                .join('|')
                .split(/,|\||、/)
                .map((k) => (<Chip key={`on-${k}`} textStyle={{ color: '#fff' }} style={styles.tag}>{k}</Chip>))
              }
            </View>
            <Text style={styles.title}>Kunyomi</Text>
            <View style={styles.tags}>
              {(details.kanji.kunyomi || [])
                .join('|')
                .split(/,|\||、/)
                .map((k) => (<Chip key={`kun-${k}`} textStyle={{ color: '#fff' }} style={styles.tag}>{k}</Chip>))
              }
            </View>
          </View>
        </View>
        <Button mode={isSelected ? "outlined" : "contained"} onPress={handlePress} style={styles.button}>{isSelected ? "Unselect" : "Select"}</Button>
        <View style={styles.details}>
          <List.Accordion title="Details" description="number of stroke, meanings, etc.">
            <DataTable.Row>
              <DataTable.Cell>id</DataTable.Cell>
              <DataTable.Cell>{details.kanji_id}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>stroke</DataTable.Cell>
              <DataTable.Cell>{details.kanji.strokes}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>on</DataTable.Cell>
              <DataTable.Cell>{details.kanji.onyomi}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>kun</DataTable.Cell>
              <DataTable.Cell>{details.kanji.kunyomi}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>meanings</DataTable.Cell>
              <DataTable.Cell>{details.kanji.meaning}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Grade</DataTable.Cell>
              <DataTable.Cell>{details.reference?.grade || '/'}</DataTable.Cell>
            </DataTable.Row>
          </List.Accordion>
        </View>
        {details.radical &&
        <View style={styles.details}>
          <List.Accordion title="Radical" description="character, number of strokes, name, etc.">
            <DataTable.Row>
              <DataTable.Cell>id</DataTable.Cell>
              <DataTable.Cell>{details.radical.radical_id}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>character</DataTable.Cell>
              <DataTable.Cell>{details.radical.character}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>stroke</DataTable.Cell>
              <DataTable.Cell>{details.radical.strokes}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>hiragana</DataTable.Cell>
              <DataTable.Cell>{details.radical.name?.hiragana || '/'}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>romaji</DataTable.Cell>
              <DataTable.Cell>{details.radical.name?.romaji || '/'}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>meanings</DataTable.Cell>
              <DataTable.Cell>{details.radical.meaning}</DataTable.Cell>
            </DataTable.Row>
          </List.Accordion>
        </View>
      }
        {details.examples &&
        <View style={styles.details}>
          <List.Accordion title="Examples" description={`Sentences/Words using the "${details.kanji.character}" character`}>
            {details.examples.map(({ japanese, meaning }) => {
              return <View key={japanese}>
                <View style={{ margin: 10 }}>
                  <Text style={{ color: colors.text }}>{japanese}</Text>
                  <Text style={{ color: colors.text, opacity: 0.5 }}>{meaning}</Text>
                </View>
                <Divider />
              </View>
            })}
          </List.Accordion>
        </View>
      }
    </ScrollView>
  </View>
);
};

