import {StyleSheet} from "react-native";
import {colors} from "../../constants";

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    touchAction: 'none',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
  },
  content: {
    justifyContent: 'space-evenly',
    flex: 1,
    margin: 20,
    backgroundColor: '#f8f8f8',
    marginTop: 0,
  },
  contentHeader: {
    flexDirection: 'row',
  },
  clearbutton: {
    borderRadius: 25,
    width: '45%',
  },
  text: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  surface: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fde2e7'
  },
  subtext: {
    color: colors.text,
    fontWeight: '700',
  },
  timer: {
    width: 80,
    height: 80,
    borderWidth: 10,
    borderColor: colors.primary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
