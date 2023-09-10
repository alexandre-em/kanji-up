import { router } from 'expo-router';
import core from 'kanji-app-core';
import { User } from 'kanji-app-types';
import React from 'react';
import { DataTable } from 'react-native-paper';

type RankListProps = {
  type: 'kanji' | 'word';
  limit?: number;
};

export default function RankList({ type, limit }: RankListProps) {
  const [rank, setRank] = React.useState([]);

  const getRanking = React.useCallback(() => {
    core.userService?.getRanking(type, limit)?.then(({ data }) => {
      setRank(data);
    });
  }, [type, core.userService]);

  React.useEffect(() => {
    getRanking();
  }, [type]);

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Name</DataTable.Title>
        <DataTable.Title numeric>Position</DataTable.Title>
        <DataTable.Title numeric>Score</DataTable.Title>
      </DataTable.Header>
      {rank.map((user: User, i: number) => {
        return (
          <DataTable.Row
            key={`rank-${i}`}
            style={{ fontFamily: 'Roboto' }}
            onPress={() => router.push(`/profile/${user.user_id}`)}>
            <DataTable.Cell>{user.name}</DataTable.Cell>
            <DataTable.Cell numeric>{i + 1}</DataTable.Cell>
            <DataTable.Cell numeric>{user.applications.kanji?.total_score}</DataTable.Cell>
          </DataTable.Row>
        );
      })}
    </DataTable>
  );
}
