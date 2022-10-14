import {StyleSheet} from "react-native";
import colors from "../../constants/colors";

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  kanjiSurface: {
    height: 60,
    width: 60,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  kanjiText: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
});

