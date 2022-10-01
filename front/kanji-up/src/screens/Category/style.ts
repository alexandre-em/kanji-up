import {StyleSheet} from "react-native";

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    justifyContent: 'space-between',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
    backgroundColor: '#fff',
  },
  tileImage: {
    width: '100%',
    height: 130,
    borderWidth: 1,
    borderColor: '#fff',
  },
  title: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    paddingLeft: 15,
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase', 
    color: '#fff',
  },
});

