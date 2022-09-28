import { StyleSheet } from "react-native";

export default StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  header: {
    flex: 0.09,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    flexWrap: 'wrap',
  },
  headerTitle: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  menu: {
    display: 'flex',
    flex: 0.2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: '45%',
    display: 'flex',
    justifyContent: 'center',
    margin: 5,
    borderRadius: 5,
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
  },
  search: {
    display: 'flex',
    alignItems: 'center',
  }
});

