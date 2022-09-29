import { StyleSheet } from "react-native";

export default StyleSheet.create({
  main: {
    flex: 1,
    maxWidth: 700,
    alignSelf: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
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
    flex: 0.1,
    display: 'flex',
    alignItems: 'center',
  },
  cardGroup: {
    flex: 0.6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#efefef',
    height: 300,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 15,
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
    padding: 10,
    margin: 10,
  },
});

