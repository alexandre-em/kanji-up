import { View, Text } from 'react-native';
import React from 'react';
import { Avatar, Surface, TouchableRipple } from 'react-native-paper';

import global from 'constants/style';
import { useUserContext } from 'components/UserProvider';
import style from './style';
import { colors } from 'constants';

export default function AppGroupButton({ appType, setAppType, applications, user }) {
  const UserContext = useUserContext();

  return (
    <View style={style.score}>
      {Object.keys(applications).map((app) => (
        <TouchableRipple onPress={() => setAppType(app)} key={app}>
          <Surface
            style={[global.surface, { backgroundColor: appType === app ? colors.elevation.level4 : '#fff', borderRadius: 15 }]}
            elevation={4}>
            <Avatar.Image size={50} style={{ backgroundColor: '#00000000' }} source={applications[app].image} />
            <Text>{(user || UserContext.state).applications[app]?.total_score || 0}</Text>
          </Surface>
        </TouchableRipple>
      ))}
    </View>
  );
}
