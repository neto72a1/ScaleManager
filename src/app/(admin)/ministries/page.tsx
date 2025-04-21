import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { Link } from 'expo-router';

interface Ministry {
  id: number;
  name: string;
}

const MinistryList = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/ministries')
      .then(response => response.json())
      .then(data => {
        setMinistries(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Text>Carregando ministérios...</Text>;
  if (error) return <Text>Erro ao carregar ministérios: {error}</Text>;

  return (
    <View>
      <Text style={styles.title}>Lista de Ministérios</Text>
      <FlatList
        data={ministries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name}</Text>
            <Link href={'/(admin)/ministries/[ministryId]/leaders'} asChild>
              <Button title="Ver Líderes" />
            </Link>
          </View>
        )}
      />
      <Link href="/(admin)/ministries/create" asChild>
        <Button title="Criar Novo Ministério" />
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default MinistryList;