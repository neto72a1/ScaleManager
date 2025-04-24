import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { AuthProvider } from "./authContexts"; // Importe o AuthProvider

const Page = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao ScaleManager!</Text>

      <View style={styles.separator} />

      <Link href="./index" style={styles.link}>
        <Text style={styles.linkText}>Ir para Login</Text>
      </Link>

      <Link href="./registerScreen" style={styles.link}>
        <Text style={styles.linkText}>Ir para Registro</Text>
      </Link>

      <Link href="./leaderAvailabilityScreen" style={styles.link}>
        <Text style={styles.linkText}>Disponibilidade (Líder)</Text>
      </Link>

      <Link href="./userAvailabilityScreen" style={styles.link}>
        <Text style={styles.linkText}>Minha Disponibilidade</Text>
      </Link>

      <Link href="./scaleScreen" style={styles.link}>
        <Text style={styles.linkText}>Escalas</Text>
      </Link>
    </View>
  );
};

const MainApp = () => {
    return (
      <AuthProvider>
        <Page />
      </AuthProvider>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: 'lightgray',
    width: '80%',
    marginVertical: 30,
  },
  link: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainApp;