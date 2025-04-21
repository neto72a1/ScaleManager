import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';

const CreateMinistryForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState(''); // Novo estado para o erro de nome
  const router = useRouter();

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('O nome do ministério é obrigatório.'); // Define a mensagem de erro
      return; // Impede o envio se o nome estiver vazio
    } else {
      setNameError(''); // Limpa o erro se o nome for válido
    }

    // Se a validação passar, continua com a criação do ministério
    fetch('/api/admin/ministries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setName('');
        router.push('../');
      })
      .catch(error => {
        setMessage(`Erro ao criar ministério: ${error.message}`);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Ministério</Text>
      <TextInput
        style={[styles.input, nameError ? styles.inputError : null]} // Aplica estilo de erro se houver um erro
        placeholder="Nome do Ministério"
        value={name}
        onChangeText={text => {
          setName(text);
          setNameError(''); // Limpa o erro quando o texto muda
        }}
      />
      {nameError && <Text style={styles.error}>{nameError}</Text>} {/* Exibe a mensagem de erro */}
      <Button title="Criar Ministério" onPress={handleSubmit} />
      {message && <Text style={styles.message}>{message}</Text>}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: 'red', // Estilo para indicar um erro no campo
  },
  error: {
    color: 'red',
    marginBottom: 10,
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

export default CreateMinistryForm;
