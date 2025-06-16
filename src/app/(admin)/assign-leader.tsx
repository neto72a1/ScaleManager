import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../authContexts'; // Ajuste o caminho se necessário

// Importe sua API_BASE_URL de um local centralizado, se possível
// Por agora, vamos redefini-la aqui, mas idealmente viria de um arquivo de configuração.
const API_BASE_URL = "http://localhost:8081/api"; // Sem barra no final

interface User {
  id: string;
  userName: string;
  email: string;
}

interface Ministry {
  id: number;
  name: string;
}

const AssignLeaderForm = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedMinistryId, setSelectedMinistryId] = useState<number | ''>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true); // Para carregar usuários e ministérios

  const { token, user } = useAuth(); // Obter o token e informações do usuário do contexto
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!token) {
      setMessage("Erro de autenticação: Token não encontrado.");
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    setMessage('');

    try {
      // Fetch Users
      const usersResponse = await fetch(`${API_BASE_URL}/Admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!usersResponse.ok) {
        throw new Error(`Erro ao buscar usuários: ${usersResponse.status}`);
      }
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Fetch Ministries
      const ministriesResponse = await fetch(`${API_BASE_URL}/Admin/ministries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!ministriesResponse.ok) {
        throw new Error(`Erro ao buscar ministérios: ${ministriesResponse.status}`);
      }
      const ministriesData = await ministriesResponse.json();
      setMinistries(ministriesData);

    } catch (error: any) {
      setMessage(`Erro ao carregar dados: ${error.message}`);
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    // Verificar se o usuário logado é Admin
    // Esta verificação é básica. O backend fará a verificação final.
    // Você pode ter uma lógica mais robusta aqui baseada nos papéis do usuário do contexto.
    if (!user?.roles?.includes("Admin")) {
        Alert.alert("Acesso Negado", "Você não tem permissão para acessar esta página.");
        // Idealmente, redirecionar ou mostrar uma mensagem apropriada
        // router.replace('/'); // Exemplo de redirecionamento
        setMessage("Acesso negado. Apenas administradores podem atribuir líderes.");
        setLoadingData(false);
        return;
    }
    fetchData();
  }, [fetchData, user]);

  const handleSubmit = async () => {
    if (!selectedUserId || selectedMinistryId === '') {
      setMessage('Por favor, selecione um usuário e um ministério.');
      Alert.alert('Campos Obrigatórios', 'Por favor, selecione um usuário e um ministério.');
      return;
    }
    if (!token) {
        setMessage("Erro de autenticação: Token não encontrado para submissão.");
        Alert.alert("Erro de Autenticação", "Não foi possível autenticar. Tente fazer login novamente.");
        return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/Admin/assign-leader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Adicionar o token de autenticação
        },
        body: JSON.stringify({ 
            userId: selectedUserId, 
            ministryId: Number(selectedMinistryId) // Garantir que ministryId é um número
        }),
      });

      const responseData = await response.json();

      if (response.ok) { // Verifica se o status é 2xx
        setMessage(responseData.message || "Líder atribuído com sucesso!");
        Alert.alert("Sucesso", responseData.message || "Líder atribuído com sucesso!");
        setSelectedUserId('');
        setSelectedMinistryId('');
        // Opcional: Atualizar a lista de usuários/líderes se necessário
      } else {
        // Erros tratados pelo backend (ex: 400 Bad Request, 404 Not Found)
        setMessage(responseData.message || responseData.title || `Erro ao atribuir líder: ${response.status}`);
        Alert.alert("Erro", responseData.message || responseData.title || `Erro ao atribuir líder: ${response.status}`);
      }
    } catch (error: any) {
      setMessage(`Erro na requisição: ${error.message}`);
      Alert.alert("Erro na Requisição", `Ocorreu um erro: ${error.message}`);
      console.error("Erro ao atribuir líder:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }
  
  // Se o usuário não for admin (após a verificação inicial), não renderizar o formulário.
  // A mensagem já terá sido definida no useEffect.
  if (!user?.roles?.includes("Admin") && !loadingData) {
      return (
          <View style={styles.container}>
              <Text style={styles.title}>Atribuir Líder a Ministério</Text>
              <Text style={styles.message}>{message || "Acesso negado."}</Text>
              <Link href="../" style={styles.link}>
                <Text>Voltar</Text>
              </Link>
          </View>
      );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atribuir Líder a Ministério</Text>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Usuário:</Text>
        <Picker
          selectedValue={selectedUserId}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedUserId(itemValue as string)}
        >
          <Picker.Item label="-- Selecione um usuário --" value="" />
          {users.map(u => (
            <Picker.Item key={u.id} label={`${u.userName} (${u.email})`} value={u.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Ministério:</Text>
        <Picker
          selectedValue={selectedMinistryId}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMinistryId(itemValue as number | '')}
        >
          <Picker.Item label="-- Selecione um ministério --" value="" />
          {ministries.map(m => (
            <Picker.Item key={m.id} label={m.name} value={m.id} />
          ))}
        </Picker>
      </View>
      <Button title={loading ? "Atribuindo..." : "Atribuir Líder"} onPress={handleSubmit} disabled={loading || loadingData} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Link href="../" style={styles.link}>
        <Text>Voltar ao Painel Administrativo</Text>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', // Um fundo suave
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50, // Aumentar altura para melhor toque
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  message: {
    marginTop: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'red', // Cor padrão para mensagens de erro
  },
  link: {
    marginTop: 20,
    color: 'blue',
    textAlign: 'center',
    fontSize: 16,
  },
  // Adicione um estilo para mensagens de sucesso se quiser diferenciar
  successMessage: {
    color: 'green',
  }
});

export default AssignLeaderForm;