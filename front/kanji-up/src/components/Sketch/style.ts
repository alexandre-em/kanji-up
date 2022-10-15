import {StyleSheet} from "react-native";

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  canvas: {
    backgroundColor: '#fff',
    maxWidth: 500,
    maxHeight: 500,
    position: 'relative',
  },
  clearbutton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
    borderRadius: 25,
  },
});

