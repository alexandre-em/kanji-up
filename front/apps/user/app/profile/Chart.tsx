import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { colors } from 'constants';
import global from 'constants/style';
import { wordColors } from 'constants/Colors';

const DAILY_SCORE_GRAPH_LIMIT = 10;
const COLUMN_WIDTH = 50;

export default function Chart({ user, apptype }) {
  const scores = user?.applications[apptype]?.scores;
  const themeColors = apptype === 'kanji' ? colors : wordColors;

  if (!scores || Object.keys(scores).length <= 0)
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', height: 220 }}>
        <Text style={global.title}>No data...</Text>
      </View>
    );

  const numberColumn = Math.min(Math.floor((Dimensions.get('window').width - 30) / COLUMN_WIDTH), DAILY_SCORE_GRAPH_LIMIT);

  const arr = Array.from(Array(numberColumn).keys());
  const stats = arr
    .map((v) => {
      const date = new Date();
      return new Date(date.setDate(date.getDate() - v));
    })
    .sort((a, b) => a.valueOf() - b.valueOf())
    .map((v) => {
      const formattedDate = `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`;

      return {
        key: `${v.getMonth() + 1}/${v.getDate()}`,
        value: scores[formattedDate] || 0,
      };
    });

  return (
    <View>
      <Text style={[global.subtitle, { marginLeft: 20 }]}>Score the last {numberColumn} days</Text>
      <LineChart
        data={{
          labels: stats.map(({ key }) => key),
          datasets: [
            {
              data: stats.map(({ value }) => value),
            },
          ],
        }}
        width={Dimensions.get('window').width - 10}
        height={220}
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: colors.secondary,
          backgroundGradientFrom: themeColors.primaryDark,
          backgroundGradientTo: themeColors.primary,
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: themeColors.primary,
          },
        }}
        bezier
        style={{
          margin: 10,
          borderRadius: 16,
          fontFamily: 'Roboto',
        }}
      />
    </View>
  );
}
