import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Chip, Divider, IconButton, List, Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';

import Row from './Row';
import styles from './style';
import { colors } from 'constants/Colors';
import { SVGUriPlatform } from 'kanji-app-svg-ui';
import { RootState } from 'store';
import core from 'kanji-app-core';
import { router, useGlobalSearchParams } from 'expo-router';
import { WORD_PROGRESSION_MAX, endpointUrls } from 'constants';
import { Content, globalStyle } from 'kanji-app-ui';
import { getKanjiList } from 'services/kanji';
import { KanjiAppRedirection } from 'services/redirections';
import useWordHook from 'app/words/hook';

const imgSize = 50;

export default function WordDetail() {
  const { access_token } = useGlobalSearchParams();
  const userState = useSelector((state: RootState) => state.user);
  const { details, isSelected, handlePress } = useWordHook();

  const headerRightComponent = useMemo(
    () =>
      !access_token ? (
        <IconButton
          icon={isSelected ? 'bookmark-minus' : 'bookmark-plus'}
          mode={isSelected ? 'outlined' : 'contained'}
          onPress={handlePress}
        />
      ) : (
        <></>
      ),
    [access_token, isSelected]
  );

  if (!details) {
    return (
      <View style={[globalStyle(colors).main, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating />
      </View>
    );
  }

  return (
    <Content
      header={{
        title: `Detail of ${details.word[0] || details.reading[0]} ${userState.progression[details.word_id] !== undefined
            ? `(${Math.min((userState.progression[details.word_id] / WORD_PROGRESSION_MAX) * 100, 100)}%)`
            : ''
          }`,
        onBack: () => router.back(),
        right: headerRightComponent,
      }}>
      <ScrollView>
        <View style={styles.content}>
          <View style={{ width: '100%' }}>
            <Text style={globalStyle(colors).title}>Word</Text>
            <View style={styles.tags}>
              {(details.word || [])
                .join('|')
                .split(/,|\||、/)
                .map((k) => (
                  <Chip key={`on-${k}`} textStyle={{ color: colors.text, fontWeight: '900' }} style={styles.tag}>
                    {k}
                  </Chip>
                ))}
            </View>

            <Text style={globalStyle(colors).title}>Reading</Text>
            <View style={styles.tags}>
              {(details.reading || [])
                .join('|')
                .split(/,|\||、/)
                .map((k) => (
                  <Chip key={`kun-${k}`} textStyle={{ color: colors.text, fontWeight: '900' }} style={styles.tag}>
                    {k}
                  </Chip>
                ))}
            </View>
          </View>
        </View>
        <Text style={globalStyle(colors).title}>Kanji used</Text>
        <ScrollView
          horizontal
          style={{ display: 'flex', flexDirection: 'row', marginBottom: 10, marginHorizontal: 20, height: imgSize + 15 }}>
          {Array.from(new Set(getKanjiList(details.word.join(',')) || [])).map((character) => (
            <Surface
              key={character}
              elevation={4}
              style={{ marginRight: 12, position: 'relative', width: imgSize, height: imgSize }}>
              <Pressable onPress={() => KanjiAppRedirection(character, core.accessToken)}>
                <View
                  style={{
                    borderColor: '#e0e0e0',
                    borderRightWidth: 1,
                    position: 'absolute',
                    width: '50%',
                    height: '100%',
                  }}></View>
                <View
                  style={{
                    borderColor: '#e0e0e0',
                    borderBottomWidth: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '50%',
                  }}></View>
                <SVGUriPlatform
                  width={imgSize}
                  height={imgSize}
                  uri={`${endpointUrls.kanji}/kanjis/image/${encodeURIComponent(character)}`}
                  alt={character}
                />
              </Pressable>
            </Surface>
          ))}
        </ScrollView>
        <Divider />
        <View style={styles.details}>
          <Row title="Word id" description={details.word_id} />
          {details.definition.map((definition, index) => (
            <View key={definition.meaning.join(',') + index}>
              <List.Accordion
                title={`Definition #${index + 1}`}
                description={`${definition.meaning[0]}...`}
                style={{ backgroundColor: '#f8f8f8' }}>
                <Row title="Word meaning" description={definition.meaning.join(', ')} />
                <Row title="Word type" description={definition.type.join(', ')} />
                <List.Accordion
                  title={`Relations (${definition.relation.length})`}
                  description={`Words related with ${details.word[0] || details.reading[0]}`}
                  style={{ backgroundColor: '#f8f8f8' }}>
                  {definition.relation.map((relation) =>
                    relation.related_word.map((related_word) => (
                      <Pressable onPress={() => router.push(`/word/${related_word.word_id}`)}>
                        <Row
                          title={`Definition ${relation.index + 1}`}
                          description={related_word.word?.join(', ') || related_word.reading?.join(', ')}
                        />
                      </Pressable>
                    ))
                  )}
                </List.Accordion>
                <Divider />
                <List.Accordion
                  title={`Examples (${definition.example.length})`}
                  description={`Sentences using ${details.word[0] || details.reading[0]}`}
                  style={{ backgroundColor: '#f8f8f8' }}>
                  {definition.example.map((example) => (
                    <Row title={example.sentence} description={example.translation} />
                  ))}
                </List.Accordion>
              </List.Accordion>
              {index < details.definition.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      </ScrollView>
    </Content>
  );
}
