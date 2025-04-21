import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useParams, Link, useRouter, useSearchParams } from 'expo-router';

const RemoveLeaderForm = () => {
  const { ministryId } = useParams<{ ministryId: string }>();
  const { leaderId } = useSearchParams<{ leaderId: string }>();
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRemove = () => {
    if (ministryId && leaderId) {
      fetch('/api/admin/remove-leader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: leaderId, ministryId: parseInt(ministryId) }),
      })
        .then(response => response.json())
        .then(data => {
          setMessage(data.message);
          router.push(`/admin/ministries/${ministryId}/leaders`);
        })
        .catch(error => {
          setMessage(`Erro ao remover líder: ${error.message}`);
        });
    } else {
      setMessage('Informações de ministério ou líder ausentes.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Remover Líder do Ministério</Text>
      {leaderId && ministryId ? (
        <>
          <Text>Tem certeza que deseja remover o líder com ID: {leaderId} do ministério com ID: {ministryId}?</Text>
          <Button title="Remover Líder" onPress={handleRemove} />
          {message && <Text style={styles.message}>{message}</Text>}
          <Link href={`/admin/ministries/${ministryId}/leaders`} style={styles.link}>
            <Text>Voltar para Lista de Líderes</Text>
          </Link>
        </>
      ) : (
        <Text>Erro: Informações de líder ou ministério inválidas.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    marginTop: 10,
    fontWeight: 'bold',
    color: 'red',
  },
  link: {
    marginTop: 20,
    color: 'blue',
  },
});

export default RemoveLeaderForm;