import { View, Text } from 'react-native';
import React from 'react';
import { colorStatus, colors, iconsStatus } from 'constants';
import { Divider, Icon } from 'react-native-paper';

export default function AnswerDetail({ item, status }: { item: ProblemType; status?: ProblemStatus }) {
  const question = item.question.question.split(/【|】/);

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 0.4, borderRightWidth: 1, borderRightColor: colors.text }}>
          <Text
            style={{
              fontSize: 30,
              fontFamily: 'ReggaeOne',
              color: question.length === 1 ? colors.warning : colors.text,
              textAlign: 'center',
            }}>
            {question
              ?.filter((q, i) => i !== 1)
              .map((str, i) =>
                i === 1 ? (
                  <>
                    <Text
                      style={{
                        fontSize: 30,
                        fontFamily: 'ReggaeOne',
                        color: colors.warning,
                        textAlign: 'center',
                      }}>
                      {question[1]}
                    </Text>
                    {str}
                  </>
                ) : (
                  str
                )
              )}
          </Text>
        </View>
        <View style={{ flex: 0.6, margin: 5 }}>
          <Text
            style={{
              color: colors.secondaryDark,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: '700',
            }}>
            <Icon source={iconsStatus[item.status]} color={colorStatus[item.status]} size={20} />
            {item.question.answer}
          </Text>
          <Divider style={{ opacity: 0.5 }} />
          <View>
            {item.question.meaning?.map((meaning, i) => (
              <View>
                {meaning.split(',').map((mean, i) => (
                  <Text key={mean + i}>{mean}</Text>
                ))}
                {i + 1 < (item.question.meaning?.length || 0) && <Divider style={{ opacity: 0.3 }} />}
              </View>
            ))}
          </View>
        </View>
      </View>
      <Divider />
    </View>
  );
}
