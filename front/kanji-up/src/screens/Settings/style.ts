import {StyleSheet} from "react-native";
import {colors} from "../../constants";

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    margin: 10,
    borderRadius: 25,
  },
});
