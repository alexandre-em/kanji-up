import { StyleSheet } from 'react-native';

import { colors } from '../../constants/Colors';

export const stepperStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: colors.primary,
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: colors.primary,
  stepStrokeUnFinishedColor: '#dedede',
  separatorFinishedColor: colors.primary,
  separatorUnFinishedColor: '#dedede',
  stepIndicatorFinishedColor: colors.primary,
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 0,
  currentStepIndicatorLabelFontSize: 0,
  stepIndicatorLabelCurrentColor: 'transparent',
  stepIndicatorLabelFinishedColor: 'transparent',
  stepIndicatorLabelUnFinishedColor: 'transparent',
  labelColor: '#999999',
  labelSize: 13,
  currentStepLabelColor: colors.primary,
};

export default StyleSheet.create({
  search: {
    display: 'flex',
    alignItems: 'center',
  },
  stepper: {
    marginVertical: 10,
  },
  surface: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    margin: 10,
    padding: 10,
    backgroundColor: colors.background2,
  },
  cardGroup: {
    flex: 0.6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
