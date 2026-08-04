import React, { ReactNode } from 'react';
import { Assets, Icon } from 'react-native-ui-lib';

import HomeIcon from '../components/svg/home';
import ProfileIcon from '../components/svg/profile';
import SearchIcon from '../components/svg/search';
import { screenNames } from './screens';

export type TabIconProps = {
  size: number;
  color: string;
};

export type TabType = {
  /** Route name of the stack screen: drives both navigation and the active state */
  key: string;
  labelKey: string;
  icon: (props: TabIconProps) => ReactNode;
};

export const tabs: TabType[] = [
  {
    key: screenNames.HOME,
    labelKey: 'tabs.home.label',
    icon: ({ size, color }) => <HomeIcon size={size} color={color} />,
  },
  {
    key: screenNames.CATEGORIES,
    labelKey: 'tabs.selection.label',
    icon: ({ size, color }) => <Icon source={Assets.icons.selection} size={size} tintColor={color} />,
  },
  {
    key: screenNames.SEARCH,
    labelKey: 'tabs.search.label',
    icon: ({ size, color }) => <SearchIcon size={size} color={color} />,
  },
  {
    key: screenNames.TRAINING,
    labelKey: 'tabs.training.label',
    icon: ({ size, color }) => <Icon source={Assets.icons.draw} size={size} tintColor={color} />,
  },
  {
    key: screenNames.PROFILE,
    labelKey: 'tabs.profile.label',
    icon: ({ size, color }) => <ProfileIcon size={size} color={color} />,
  },
  {
    key: screenNames.SETTINGS,
    labelKey: 'tabs.settings.label',
    icon: ({ size, color }) => <Icon source={Assets.icons.setting} size={size} tintColor={color} />,
  },
];

export const TAB_VISIBLE_ROUTES = [
  screenNames.HOME,
  screenNames.SEARCH,
  screenNames.CATEGORIES,
  screenNames.KANJIS,
  screenNames.SETTINGS,
  screenNames.TRAINING,
  screenNames.PROFILE,
];
