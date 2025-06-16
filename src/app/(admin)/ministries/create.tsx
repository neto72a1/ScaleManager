import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../authContexts'; // Ajuste o caminho se necessário

// Defina sua API_BASE_URL. Idealmente, importe de um arquivo de configuração.
const API_BASE_URL = "http://localhost:8081/api";

const CreateMinistryForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false); // Estado para o carregamento da submissão
  const { token } = useAuth(); // Obter o token do contexto
  const router = useRouter();

  const handleSubmit = async () => {
    setNameError(''); // Limpa erros anteriores
    setMessage('');   // Limpa mensagens anteriores

    if (!name.trim()) {
      setNameError('O nome do ministério é obrigatório.');
      return;
    }

    if (!token) {
      Alert.alert("Erro de Autenticação", "Não foi possível autenticar. Tente fazer login novamente.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Admin/ministries`, { // URL completa da API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Adicionar o token de autenticação
        },
        body: JSON.stringify({ name }), // ViewModel esperado pelo backend é CreateMinistryViewModel { string Name }
      });

      const responseData = await response.json();

      if (response.ok) { // Verifica se o status é 2xx (ex: 200 OK ou 201 Created)
        Alert.alert("Sucesso", responseData.message || "Ministério criado com sucesso!");
        setName(''); // Limpa o campo
        // Navega para a lista de ministérios ou para o painel admin.
        // Se esta tela está em app/(admin)/ministries/create.tsx,
        // router.push('../') irá para app/(admin)/ministries/index.tsx (ou page.tsx)
        router.push('../'); 
      } else {
        // Erros tratados pelo backend (ex: 400 Bad Request se o nome já existe)
        setMessage(responseData.message || responseData.title || `Erro ao criar ministério: ${response.status}`);
        Alert.alert("Erro", responseData.message || responseData.title || `Erro ao criar ministério: ${response.status}`);
      }
    } catch (error: any) {
      setMessage(`Erro na requisição: ${error.message}`);
      Alert.alert("Erro na Requisição", `Ocorreu um erro: ${error.message}`);
      console.error("Erro ao criar ministério:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Ministério</Text>
      <TextInput
        style={[styles.input, nameError ? styles.inputError : null]}
        placeholder="Nome do Ministério"
        value={name}
        onChangeText={text => {
          setName(text);
          if (text.trim()) { // Limpa o erro assim que o usuário começa a digitar algo válido
            setNameError('');
          }
        }}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      
      <Button 
        title={loading ? "Criando..." : "Criar Ministério"} 
        onPress={handleSubmit} 
        disabled={loading} 
      />

      {message ? <Text style={message.startsWith("Erro") ? styles.errorText : styles.successMessage}>{message}</Text> : null}
      
      <Link href="../" asChild style={styles.link}>
        <TouchableOpacity>
            <Text style={styles.linkText}>Voltar para Lista de Ministérios</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#343a40',
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    marginBottom: 10, // Espaço antes da mensagem de erro
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc3545', // Vermelho para erro
  },
  errorText: { // Renomeado de 'error' para 'errorText' para evitar conflito com a variável error
    color: '#dc3545',
    marginBottom: 15, // Espaço depois da mensagem de erro
    fontSize: 14,
  },
  message: { // Estilo genérico para mensagens
    marginTop: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  successMessage: { // Estilo específico para mensagens de sucesso
    color: '#28a745', // Verde para sucesso
    marginTop: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  link: {
    marginTop: 25,
  },
  linkText: { // Estilo para o texto do link para que se pareça com um link
    color: '#007bff',
    textAlign: 'center',
    fontSize: 16,
  }
});

export default CreateMinistryForm;
