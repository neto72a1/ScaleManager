import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import {  useRouter } from 'expo-router';

const RemoveLeaderForm = () => {
  const  router = useRouter();
  const { ministryId, leaderId } = router.params || { ministryId: undefined, leaderId: undefined };
  const [message, setMessage] = useState('');


  const handleRemove = () => {
    if (ministryId && leaderId) {
      fetch('/api/admin/remove-leader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: leaderId, ministryId: parseInt(ministryId as string, 10) }), // Certifique-se de que ministryId é um número
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
          <Text>
            Tem certeza que deseja remover o líder com ID: {leaderId} do ministério com ID: {ministryId}?
          </Text>
          <Button title="Remover Líder" onPress={handleRemove} />
          {message && <Text style={styles.message}>{message}</Text>}
          <Button title="Voltar para Lista de Líderes" onPress={() => router.push(`/admin/ministries/${ministryId}/leaders`)} />
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
