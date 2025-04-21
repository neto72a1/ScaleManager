import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from "../contexts/authContexts"; // Importe o contexto de autenticação

const AdminDashboard = () => {
  const { user } = useAuth(); // Obtenha o usuário do contexto

  return (
    <View>
      <Text>Painel Administrativo</Text>
      {user && (
        <Text>
          Bem-vindo, {user.name}!
        </Text>
      )}
      {/* Adicione links rápidos ou informações aqui */}
    </View>
  );
};

export default AdminDashboard;