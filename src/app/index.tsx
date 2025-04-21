import React, { useState } from 'react';
import { TextInput, Button, View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from "./contexts/authContexts"; // Ajuste o caminho se necessário
import { styles } from "./styles/loginScreenStyle";
import { registerRootComponent } from 'expo';
import App from './app';

registerRootComponent(App);

const API_BASE_URL = "http://localhost:8081/api";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Adicione o estado de carregamento
    const { signIn } = useAuth();
    const router = useRouter();

    async function handleLogin() {
        setLoading(true); // Defina loading como true no início
        try {
            if (!email) {
                Alert.alert("Email", "Insira o seu e-mail!");
                setLoading(false); // Defina loading como false em caso de erro
                return;
            }

            if (!password) {
                Alert.alert("Senha", "Insira a sua senha!");
                setLoading(false); // Defina loading como false em caso de erro
                return;
            }

            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            if (response.status === 200) {
                const { token, roles } = response.data; // Pegue o token e as roles
                await signIn(token); // Use a função signIn do contexto
                router.push("/"); // Navega para a tela principal (rota '/')
            } else {
                Alert.alert("Erro", response.data?.message || "Credenciais inválidas.");
            }
        } catch (error) {
            Alert.alert("Erro", "Erro ao fazer login. Verifique suas credenciais e a conexão com o servidor.");
            console.error("Erro no login:", error);
        } finally {
            setLoading(false); // Defina loading como false no final (sucesso ou falha)
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
                <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/registerScreen")}>
                <Text style={styles.registerText}>Não tem uma conta? Cadastre-se</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;