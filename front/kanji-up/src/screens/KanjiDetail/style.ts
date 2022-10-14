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
  content: {
    flexDirection: 'row',
    margin: 20,
  },
  title: {
    fontWeight: '700',
    color: colors.text,
    marginVertical: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginHorizontal: 5,
    marginBottom: 5,
    backgroundColor: colors.secondary,
  },
  button: {
    width: '90%',
    borderRadius: 25,
    alignSelf: 'center',
    margin: 10,
  },
  details: {
  },
});

