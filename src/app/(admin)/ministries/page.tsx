import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../authContexts'; // Ajuste o caminho se necessário
import { FontAwesome5 } from '@expo/vector-icons'; // Para ícones

// Defina sua API_BASE_URL. Idealmente, importe de um arquivo de configuração.
const API_BASE_URL = "http://localhost:8081/api";

interface Ministry {
  id: number;
  name: string;
  // Você pode adicionar mais campos se sua API retornar (ex: leaderCount)
}

const MinistryListScreen = () => { // Renomeado para clareza como uma tela
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Obter o token do contexto
  const router = useRouter();

  const fetchMinistries = useCallback(async () => {
    if (!token) {
      setError("Usuário não autenticado. Token não encontrado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/Admin/ministries`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Erro ao buscar ministérios: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (e) { /* Ignorar se o corpo do erro não for JSON */ }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMinistries(data);
    } catch (err: any) {
      console.error("Falha ao buscar ministérios:", err);
      setError(err.message || "Ocorreu um erro desconhecido ao buscar ministérios.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMinistries();
  }, [fetchMinistries]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando ministérios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar ministérios: {error}</Text>
        <Button title="Tentar Novamente" onPress={fetchMinistries} color="#007AFF" />
        <Link href="/(admin)" asChild style={styles.link}>
            <TouchableOpacity><Text style={styles.linkText}>Voltar ao Painel</Text></TouchableOpacity>
        </Link>
      </View>
    );
  }

  const renderMinistryItem = ({ item }: { item: Ministry }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemTextName}>{item.name}</Text>
      <View style={styles.actionsContainer}>
        <Link href={`/(admin)/ministries/${item.id}/leaders`} asChild>
          <TouchableOpacity style={[styles.actionButton, styles.viewLeadersButton]}>
            <FontAwesome5 name="users" size={16} color="#fff" />
            <Text style={styles.actionButtonText}> Ver Líderes</Text>
          </TouchableOpacity>
        </Link>
        {/* Adicione mais botões de ação aqui, como "Editar", "Remover", "Ver Detalhes da Página" */}
        {/* Exemplo: Link para a página de detalhes do ministério (page.tsx) */}
        <Link href={`/(admin)/ministries/page`} asChild>
          <TouchableOpacity style={[styles.actionButton, styles.detailsButton]}>
            <FontAwesome5 name="eye" size={16} color="#fff" />
            <Text style={styles.actionButtonText}> Detalhes</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* O título "Gerenciar Ministérios" já será definido pelo AdminLayout.tsx */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Lista de Ministérios</Text>
        <Link href="/(admin)/ministries/create" asChild>
          <TouchableOpacity style={styles.createButton}>
            <FontAwesome5 name="plus" size={16} color="#fff" />
            <Text style={styles.createButtonText}> Novo Ministério</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <FlatList
        data={ministries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMinistryItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum ministério encontrado.</Text>}
        contentContainerStyle={ministries.length === 0 ? styles.centeredList : {paddingBottom: 20}}
      />
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#343a40',
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
    flexDirection: 'column', // Para empilhar nome e botões
  },
  itemTextName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10, // Espaço antes dos botões de ação
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Alinha botões à esquerda
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10, // Espaço entre botões
  },
  viewLeadersButton: {
    backgroundColor: '#007bff', // Azul
  },
  detailsButton: {
    backgroundColor: '#6c757d', // Cinza
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745', // Verde para criar
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginTop: 20,
  },
  linkText: {
     color: '#007bff',
    textAlign: 'center',
    fontSize: 16,
    padding: 10,
  }
});

export default MinistryListScreen;