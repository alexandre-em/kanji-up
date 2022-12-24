import {StyleSheet} from "react-native";
import {colors} from "../../constants";

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
  },
  content: {
    height: '100%',
    width: '100%',
    padding: 20,
    paddingBottom: 0,
  },
  surface: {
    margin: 10,
    padding: 10,
    width: '90%',
    borderRadius: 15,
    alignSelf: 'center',
  },
  search: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fde2e7',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    margin: 30,
    alignSelf: 'center'
  },
  icon: {
    width: 45,
    height: 45,
    marginRight: 10,
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: colors.primary,
    borderRadius: 15,
    textAlign: 'center',
  },
});
