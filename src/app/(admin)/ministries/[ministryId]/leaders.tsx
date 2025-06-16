import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Link, useGlobalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../authContexts'; // Ajuste o caminho se necessário
import { FontAwesome5 } from '@expo/vector-icons'; // Para ícones

// Defina sua API_BASE_URL. Idealmente, importe de um arquivo de configuração.
const API_BASE_URL = "http://localhost:8081/api";

interface Leader {
  id: string;
  userName: string;
  email: string;
}

const MinistryLeadersListScreen = () => {
  const params = useGlobalSearchParams<{ ministryId?: string }>(); // ministryId pode ser undefined inicialmente
  const ministryId = params.ministryId;

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [ministryName, setMinistryName] = useState<string>(''); // Para exibir o nome do ministério
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const fetchMinistryDetailsAndLeaders = useCallback(async () => {
    if (!token) {
      setError("Usuário não autenticado. Token não encontrado.");
      setLoading(false);
      return;
    }
    if (!ministryId) {
      setError("ID do Ministério não fornecido na rota.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Opcional: Buscar detalhes do ministério para exibir o nome
      // Se o seu endpoint de líderes já retorna o nome do ministério, pode pular isso.
      // Assumindo que você tem um endpoint para buscar um ministério específico.
      // Se não, você pode passar o nome do ministério como parâmetro de rota da tela anterior.
      const ministryDetailsResponse = await fetch(`${API_BASE_URL}/Admin/ministries/${ministryId}`, { // Endpoint hipotético
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ministryDetailsResponse.ok) {
          const ministryData = await ministryDetailsResponse.json();
          setMinistryName(ministryData.name || `Ministério ID: ${ministryId}`);
      } else {
          setMinistryName(`Ministério ID: ${ministryId}`); // Fallback
      }


      // Buscar Líderes
      const response = await fetch(`${API_BASE_URL}/Admin/leaders/${ministryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Erro ao buscar líderes: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (e) { /* Ignorar */ }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setLeaders(data);
    } catch (err: any) {
      console.error("Falha ao buscar líderes:", err);
      setError(err.message || "Ocorreu um erro desconhecido ao buscar líderes.");
    } finally {
      setLoading(false);
    }
  }, [token, ministryId]);

  useEffect(() => {
    fetchMinistryDetailsAndLeaders();
  }, [fetchMinistryDetailsAndLeaders]);

  const handleRemoveLeader = async (leaderIdToRemove: string) => {
    if (!token || !ministryId) return;

    Alert.alert(
        "Confirmar Remoção",
        `Tem certeza que deseja remover este líder do ministério?`,
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Remover", 
                style: "destructive", 
                onPress: async () => {
                    setLoading(true); // Pode usar um loading específico para remoção
                    try {
                        const response = await fetch(`${API_BASE_URL}/Admin/remove-leader`, {
                            method: 'POST', // Seu endpoint AdminController usa POST para remove-leader
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: leaderIdToRemove, ministryId: parseInt(ministryId) })
                        });
                        const responseData = await response.json();
                        if (!response.ok) {
                            throw new Error(responseData.message || `Erro ao remover líder: ${response.status}`);
                        }
                        Alert.alert("Sucesso", responseData.message || "Líder removido com sucesso.");
                        fetchMinistryDetailsAndLeaders(); // Recarregar a lista de líderes
                    } catch (err: any) {
                        Alert.alert("Erro", err.message || "Não foi possível remover o líder.");
                        console.error("Erro ao remover líder:", err);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]
    );
  };


  if (!ministryId && !loading) { // Se ministryId não estiver presente após o carregamento inicial
    return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>ID do Ministério não encontrado.</Text>
            <Link href="/(admin)/ministries/page" asChild style={styles.link}>
                <TouchableOpacity><Text style={styles.linkText}>Voltar para Ministérios</Text></TouchableOpacity>
            </Link>
        </View>
    );
  }


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando líderes para {ministryName || `Ministério ID: ${ministryId}`}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar líderes: {error}</Text>
        <Button title="Tentar Novamente" onPress={fetchMinistryDetailsAndLeaders} color="#007AFF" />
        <Link href="/(admin)/ministries/page" asChild style={styles.link}>
             <TouchableOpacity><Text style={styles.linkText}>Voltar para Ministérios</Text></TouchableOpacity>
        </Link>
      </View>
    );
  }

  const renderLeaderItem = ({ item }: { item: Leader }) => (
    <View style={styles.listItem}>
      <View style={styles.leaderInfo}>
        <Text style={styles.itemTextName}>{item.userName}</Text>
        <Text style={styles.itemTextEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.actionButton, styles.removeButton]} 
        onPress={() => handleRemoveLeader(item.id)}
      >
        <FontAwesome5 name="user-minus" size={16} color="#fff" />
        <Text style={styles.actionButtonText}> Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Líderes de: {ministryName}</Text>
      <FlatList
        data={leaders}
        keyExtractor={(item) => item.id}
        renderItem={renderLeaderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum líder encontrado para este ministério.</Text>}
        contentContainerStyle={leaders.length === 0 ? styles.centeredList : {paddingBottom: 20}}
      />
      <Link href={`/(admin)/assign-leader?ministryId=${ministryId}`} asChild style={styles.link}>
        <TouchableOpacity style={[styles.actionButton, styles.addLeaderButton, styles.fullWidthButton]}>
            <FontAwesome5 name="user-plus" size={16} color="#fff" />
            <Text style={styles.actionButtonText}> Adicionar Líder a este Ministério</Text>
        </TouchableOpacity>
      </Link>
      {/* O botão de voltar para a lista de ministérios é geralmente tratado pelo header do Stack Navigator */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  leaderInfo: {
    flex: 1,
  },
  itemTextName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#495057',
  },
  itemTextEmail: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionsContainer: { // Removido, ações agora direto no listItem
    // flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  removeButton: {
    backgroundColor: '#dc3545', // Vermelho para remover
  },
  addLeaderButton: {
    backgroundColor: '#28a745', // Verde para adicionar
    justifyContent: 'center',
  },
  fullWidthButton: {
    marginTop: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 20,
  },
   link: {
    marginTop: 10, // Reduzido margin para o botão de adicionar
  },
  linkText: { // Estilo para texto dentro de TouchableOpacity em Link
     color: '#007bff',
    textAlign: 'center',
    fontSize: 16,
  }
});

export default MinistryLeadersListScreen;






