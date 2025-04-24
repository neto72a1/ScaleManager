import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";
import axios from 'axios';

import { styles } from "./styles/registerScreenStyle";

const API_BASE_URL = "https://192.168.100.73:8081/api/";

interface Ministry {
    id: string;
    name: string;
    functions: string[];
}

const RegisterScreen = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
    const [ministryFunctions, setMinistryFunctions] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false); // Adicione o estado de carregamento

    const availableMinistries: Ministry[] = [
        { id: "music", name: "Música", functions: ["Vocal", "Violão", "Teclado", "Guitarra", "Baixo", "Bateria", "Metais", "Percurssão", "Direção Musical"] },
        { id: "communication", name: "Comunicação", functions: ["Transmissão", "Som Transmissão", "Câmera Móvel", "Redes Sociais", "Projeção", "Som", "Fotografia"] },
        // Adicione mais ministérios e suas funções
    ];

    const router = useRouter();

    const handleMinistrySelection = (ministryId: string) => {
        if (selectedMinistries.includes(ministryId)) {
            setSelectedMinistries(selectedMinistries.filter(id => id !== ministryId));
            const newFunctions = { ...ministryFunctions };
            delete newFunctions[ministryId];
            setMinistryFunctions(newFunctions);
        } else {
            setSelectedMinistries([...selectedMinistries, ministryId]);
            setMinistryFunctions({ ...ministryFunctions, [ministryId]: [] });
        }
    };

    const handleFunctionSelection = (ministryId: string, functionName: string, isSelected: boolean) => {
        const currentFunctions = ministryFunctions[ministryId] || [];
        if (isSelected) {
            setMinistryFunctions({
                ...ministryFunctions,
                [ministryId]: [...currentFunctions, functionName],
            });
        } else {
            setMinistryFunctions({
                ...ministryFunctions,
                [ministryId]: currentFunctions.filter(func => func !== functionName),
            });
        }
    };

    const handleRegister = async () => {
        setLoading(true); // Defina loading como true no início
        if (password !== confirmPassword) {
            Alert.alert("Erro", "Senhas não coincidem!");
            setLoading(false); // Defina loading como false em caso de erro
            return;
        }

        try {
            const ministriesToSend = selectedMinistries.map(ministryId => ({
                ministry: availableMinistries.find(m => m.id === ministryId)?.name || '',
                functions: ministryFunctions[ministryId] || []
            }));

            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                name,
                email,
                phone,
                birthday,
                password,
                ministries: ministriesToSend
            });

            if (response.status === 201) {
                Alert.alert("Sucesso", "Registro realizado com sucesso. Faça login.", [
                    { text: "OK", onPress: () => router.push("./index") } // Removido ".tsx"
                ]);
            } else {
                Alert.alert("Erro", response.data?.message || "Erro ao registrar.");
            }
        } catch (error: any) { // Especifique o tipo do erro como any
            console.error("Erro no registro:", error);
            Alert.alert("Erro", error.response?.data?.message || "Ocorreu um erro ao registrar."); // Trata erros de resposta da API
        } finally {
            setLoading(false); // Defina loading como false no final (sucesso ou falha)
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Registro</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome Completo"
                value={name}
                onChangeText={setName}
            />

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
                placeholder="Celular"
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={phone}
                onChangeText={setPhone}
            />

            <TextInput
                style={styles.input}
                placeholder="Data de aniversário (AAAA-MM-DD)"
                keyboardType="default"
                autoCapitalize="none"
                value={birthday}
                onChangeText={setBirthday}
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <Text style={styles.subtitle}>Ministérios de Interesse:</Text>
            {availableMinistries.map((ministry) => (
                <View key={ministry.id} style={styles.checkboxContainer}>
                    <CheckBox
                        value={selectedMinistries.includes(ministry.id)}
                        onValueChange={() => handleMinistrySelection(ministry.id)}
                    />
                    <Text style={styles.checkboxLabel}>{ministry.name}</Text>
                </View>
            ))}

            {selectedMinistries.map((ministryId) => {
                const ministry = availableMinistries.find(m => m.id === ministryId);
                if (ministry) {
                    return (
                        <View key={ministryId} style={styles.ministryFunctionsContainer}>
                            <Text style={styles.subtitle}>{ministry.name} - Funções:</Text>
                            {ministry.functions.map((func: string) => (
                                <View key={func} style={styles.checkboxContainer}>
                                    <CheckBox
                                        value={ministryFunctions[ministryId]?.includes(func)}
                                        onValueChange={(newValue) => handleFunctionSelection(ministryId, func, newValue)}
                                    />
                                    <Text style={styles.checkboxLabel}>{func}</Text>
                                </View>
                            ))}
                        </View>
                    );
                }
                return null;
            })}

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("./index")}> 
                <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default RegisterScreen;