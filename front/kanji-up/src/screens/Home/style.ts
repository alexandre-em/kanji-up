import { Platform, StatusBar, StyleSheet } from "react-native";
import colors from "../../constants/colors";

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    backgroundColor: colors.primary,
    padding: 5,
    borderRadius: 25,
  },
  search: {
    display: 'flex',
    alignItems: 'center',
  },
  stepper: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    margin: 10,
    marginLeft: 20,
    color: colors.text,
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
    backgroundColor: '#fde2e7',
  },
  cardGroup: {
    flex: 0.6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
