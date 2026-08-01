import React, { ReactNode } from 'react';
import { Assets, Icon } from 'react-native-ui-lib';

import HomeIcon from '../components/svg/home';
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
    key: screenNames.EVALUATION,
    labelKey: 'tabs.training.label',
    icon: ({ size, color }) => <Icon source={Assets.icons.draw} size={size} tintColor={color} />,
  },
  {
    key: screenNames.SETTINGS,
    labelKey: 'tabs.settings.label',
    icon: ({ size, color }) => <Icon source={Assets.icons.setting} size={size} tintColor={color} />,
  },
];

/**
 * Routes displaying the floating tab bar. Kanji List is a browsing screen (scroll through a grid,
 * tap in and out), not a narrow detail view, so it keeps the bar too. Difficulties and Kanji
 * detail (drawing/practice) stay excluded — genuine full-screen detail views. Evaluation is a tab
 * entry point but hides the bar, since it is a full screen drawing session.
 */
export const TAB_VISIBLE_ROUTES = [screenNames.HOME, screenNames.CATEGORIES, screenNames.KANJIS, screenNames.SETTINGS];
