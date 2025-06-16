import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from "../authContexts"; // Verifique se este caminho está correto
import { Link } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons'; // Exemplo de ícone

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Painel Administrativo</Text>
        {user && (
          <Text style={styles.welcomeMessage}>
            Bem-vindo, {user.name}!
          </Text>
        )}

        <View style={styles.grid}>
          <Link href="/(admin)/users" asChild>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="users-cog" size={30} color="#fff" />
              <Text style={styles.cardText}>Gerenciar Usuários</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(admin)/ministries/page" asChild>
            {/* Este link levará para app/(admin)/ministries/index.tsx (ou page.tsx) */}
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="church" size={30} color="#fff" />
              <Text style={styles.cardText}>Gerenciar Ministérios</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(admin)/ministries/create" asChild>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="plus-circle" size={30} color="#fff" />
              <Text style={styles.cardText}>Criar Ministério</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(admin)/assign-leader" asChild>
            <TouchableOpacity style={styles.card}>
              <FontAwesome5 name="user-plus" size={30} color="#fff" />
              <Text style={styles.cardText}>Atribuir Líder</Text>
            </TouchableOpacity>
          </Link>

          {/* Você não cria um link para "layout.tsx", pois ele não é uma tela navegável, 
          mas sim um componente que define a estrutura de navegação para o grupo (admin).
          A navegação de "retorno" para este AdminDashboard (index.tsx dentro de (admin))
          será automaticamente fornecida pelo Stack navigator definido em app/(admin)/_layout.tsx
          quando você navegar para qualquer uma dessas outras telas administrativas.
          */}

        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  welcomeMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Para melhor espaçamento se tiver número ímpar de itens
  },
  card: {
    backgroundColor: '#007bff',
    paddingVertical: 20, // Ajustado para melhor proporção
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%', // Ajustado para caber dois por linha com algum espaço
    minHeight: 140, // Aumentado um pouco
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardText: {
    color: '#fff',
    marginTop: 12, // Aumentado um pouco
    fontSize: 15, // Ligeiramente menor para caber melhor
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AdminDashboard;