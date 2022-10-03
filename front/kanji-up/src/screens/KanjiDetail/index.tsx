import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Appbar} from 'react-native-paper';
import {kanjiService} from '../../service';
import {KanjiDetailProps} from '../../types/screens';

export default function KanjiDetail({ navigation, route }: KanjiDetailProps) {
  // const { id } = route.params;
  const id = '90ddd5c6-d7dd-4e5a-b371-3bfd2a2404c9';
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (id) {
      kanjiService
        .getKanjiDetail({ id })
        .then((res) => setDetails(res.data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  console.log(id);

  return (
    <View>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Detail of ${details?.kanji?.character}`} titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      </Appbar.Header>
      <Text>KanjiDetail</Text>
    </View>
  );
};

