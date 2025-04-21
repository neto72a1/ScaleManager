import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f4f4f4',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    calendar: {
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 15,
      marginBottom: 10,
    },
    scheduleItem: {
      backgroundColor: '#fff',
      padding: 15,
      marginBottom: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    teamName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    members: {
      fontSize: 14,
      color: '#555',
    },
    noSchedule: {
      fontSize: 16,
      color: '#777',
      textAlign: 'center',
      marginTop: 10,
    },
  });