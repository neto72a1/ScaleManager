import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

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
  const [userId, setUserId] = useState<string>('');
  const [ministryId, setMinistryId] = useState<number | ''>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/users')
      .then(response => response.json())
      .then(data => setUsers(data));

    fetch('/api/admin/ministries')
      .then(response => response.json())
      .then(data => setMinistries(data));
  }, []);

  const handleSubmit = () => {
    if (userId && ministryId) {
      fetch('/api/admin/assign-leader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ministryId }),
      })
        .then(response => response.json())
        .then(data => {
          setMessage(data.message);
          setUserId('');
          setMinistryId('');
        })
        .catch(error => {
          setMessage(`Erro ao atribuir líder: ${error.message}`);
        });
    } else {
      setMessage('Por favor, selecione um usuário e um ministério.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atribuir Líder a Ministério</Text>
      <View style={styles.pickerContainer}>
        <Text>Usuário:</Text>
        <Picker
          selectedValue={userId}
          style={styles.picker}
          onValueChange={(itemValue) => setUserId(itemValue)}
        >
          <Picker.Item label="Selecione um usuário" value="" />
          {users.map(user => (
            <Picker.Item key={user.id} label={`${user.userName} (${user.email})`} value={user.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text>Ministério:</Text>
        <Picker
          selectedValue={ministryId}
          style={styles.picker}
          onValueChange={(itemValue) => setMinistryId(itemValue)}
        >
          <Picker.Item label="Selecione um ministério" value="" />
          {ministries.map(ministry => (
            <Picker.Item key={ministry.id} label={ministry.name} value={ministry.id} />
          ))}
        </Picker>
      </View>
      <Button title="Atribuir Líder" onPress={handleSubmit} />
      {message && <Text style={styles.message}>{message}</Text>}
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  message: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: 'blue',
  },
});

export default AssignLeaderForm;