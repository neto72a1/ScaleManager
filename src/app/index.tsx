import React, { useState } from 'react';
import { TextInput, View, Text, Alert, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from "./authContexts"; // Ajuste o caminho se necessário
import { styles } from "./styles/loginScreenStyle"; // Usaremos os estilos definidos abaixo ou ajuste
// Removido: import { registerRootComponent } from 'expo';
// Removido: import App from './app';

// registerRootComponent(App); // REMOVIDO - Isto deve estar no ponto de entrada do seu app (App.tsx ou index.js)

const API_BASE_URL = "http://localhost:8081/api";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    async function handleLogin() {
        setLoading(true);
        try {
            if (!email.trim()) {
                Alert.alert("Email Inválido", "Por favor, insira o seu e-mail.");
                setLoading(false);
                return;
            }

            if (!password) {
                Alert.alert("Senha Inválida", "Por favor, insira a sua senha.");
                setLoading(false);
                return;
            }

            const response = await axios.post(`${API_BASE_URL}/Auth/login`, {
                email,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 && response.data.token) {
                const { token, roles, name, userId } = response.data; // Assumindo que a API retorna 'roles'
                
                // O signIn do seu AuthContext já deve decodificar o token e armazenar o usuário com seus papéis.
                // A função signIn no AuthContext é quem realmente define o 'user' no contexto.
                await signIn(token); 

                // Após o signIn, o user no AuthContext deve estar atualizado.
                // Para o redirecionamento imediato, podemos usar as 'roles' da resposta da API.
                // Certifique-se que 'roles' é um array de strings.
                const userRoles = Array.isArray(roles) ? roles : (typeof roles === 'string' ? [roles] : []);

                Alert.alert("Login Bem-sucedido", `Bem-vindo, ${name || email}!`);

                if (userRoles.includes('Admin')) {
                    router.replace('/(admin)'); // Rota para o dashboard do admin
                } else if (userRoles.includes('leader')) {
                    router.replace('/leaderAvailabilityScreen'); // Rota para o dashboard do líder
                } else {
                    router.replace('/homeScreen'); // Rota para a home de usuários comuns
                }
            } else {
                // Se o status não for 200 ou não houver token, trate como erro.
                Alert.alert("Erro de Login", response.data?.message || "Credenciais inválidas ou erro na resposta do servidor.");
            }
        } catch (error: any) {
            console.error("Erro no login:", error.isAxiosError ? JSON.stringify(error.toJSON(), null, 2) : error);
            if (error.response) {
                Alert.alert("Erro de Login", `Erro ${error.response.status}: ${error.response.data?.message || 'Credenciais inválidas.'}`);
            } else if (error.request) {
                Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor. Verifique sua conexão.");
            } else {
                Alert.alert("Erro", "Erro ao fazer login. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/registerScreen")}>
                <Text style={styles.registerText}>Não tem uma conta? Cadastre-se</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;