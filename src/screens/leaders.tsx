import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { Link, useGlobalSearchParams, useRouter } from 'expo-router'; // Importe useRouter também
import { ActivityIndicator } from 'react-native';
import { UrlObject } from 'expo-router';

interface Leader {
  id: string;
  userName: string;
  email: string;
}

const MinistryLeadersList = () => {
  const { ministryId } = useGlobalSearchParams<{ ministryId: string }>();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Inicialize o useRouter

  useEffect(() => {
    if (ministryId) {
      const fetchLeaders = async () => {
        try {
          const response = await fetch(`/api/admin/leaders/${ministryId}`);
          if (!response.ok) {
            throw new Error(`Erro ao buscar líderes: ${response.status}`);
          }
          const data = await response.json();
          setLeaders(data);
          setLoading(false);
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
      };
      fetchLeaders();
    }
  }, [ministryId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando líderes...</Text>
      </View>
    );
  }
  if (error) return <Text style={styles.errorText}>Erro: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Líderes do Ministério (ID: {ministryId})</Text>
      <FlatList
        data={leaders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.userName} ({item.email})</Text>
            <Link
              href={{
                pathname: '/admin/ministries/leaders/remove',
                query: {
                  ministryId: ministryId,
                  leaderId: item.id,
                },
              } as UrlObject} // Adicione a tipagem aqui
              asChild
            >
              <Button title="Remover" />
            </Link>
          </View>
        )}
      />
      <Link href="../" style={styles.link}>
        <Text>Voltar para Lista de Ministérios</Text>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  link: {
    marginTop: 20,
    color: 'blue',
  },
});

export default MinistryLeadersList;


