import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Button } from "react-native";
// Se você estiver usando DateTimePicker, mantenha o import:
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";
import axios from 'axios';

import { styles } from "./styles/registerScreenStyle"; // Supondo que você tem este arquivo

// CORREÇÃO 1: Remover a barra final ou ajustar a concatenação
const API_BASE_URL = "http://localhost:8081/api"; // Sem barra no final

interface Ministry {
    id: string;
    name: string;
    functions: string[];
}

const RegisterScreen = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState(""); // Mantenha como string se o usuário digita AAAA-MM-DD
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
    const [ministryFunctions, setMinistryFunctions] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);

    // Se estiver usando DateTimePicker, os estados abaixo seriam relevantes:
    // const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
    // const [showDatePicker, setShowDatePicker] = useState(false);

    const availableMinistries: Ministry[] = [
        { id: "music", name: "Música", functions: ["Vocal", "Violão", "Teclado", "Guitarra", "Baixo", "Bateria", "Metais", "Percurssão", "Direção Musical"] },
        { id: "communication", name: "Comunicação", functions: ["Transmissão", "Som Transmissão", "Câmera Móvel", "Redes Sociais", "Projeção", "Som", "Fotografia"] },
    ];

    const router = useRouter();

    // Se estiver usando DateTimePicker, a função formatDateForAPI seria útil:
    // const formatDateForAPI = (date: Date | undefined): string => {
    //     if (!date) return "";
    //     const year = date.getFullYear();
    //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const day = date.getDate().toString().padStart(2, '0');
    //     return `${year}-${month}-${day}`;
    // };

    // const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    //     const currentDate = selectedDate || dateOfBirth;
    //     setShowDatePicker(Platform.OS === 'ios');
    //     if (currentDate) {
    //         setDateOfBirth(currentDate);
    //     }
    // };

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
        setLoading(true);
        if (password !== confirmPassword) {
            Alert.alert("Erro", "Senhas não coincidem!");
            setLoading(false);
            return;
        }

        // Validação simples para o formato da data (se digitada manualmente)
        // Para uma validação robusta, considere uma biblioteca ou regex mais complexo.
        // Ou use DateTimePicker para garantir o formato.
        if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
            Alert.alert("Erro", "Formato da data de aniversário inválido. Use AAAA-MM-DD.");
            setLoading(false);
            return;
        }
        // const formattedBirthday = dateOfBirth ? formatDateForAPI(dateOfBirth) : birthday; // Use se tiver DateTimePicker

        try {
            const ministriesToSend = selectedMinistries.map(ministryId => ({
                ministry: availableMinistries.find(m => m.id === ministryId)?.name || '',
                functions: ministryFunctions[ministryId] || []
            }));

            const userData = {
                name,
                email,
                phone,
                birthday, // Se estiver usando DateTimePicker, use formattedBirthday
                password,
                ministries: ministriesToSend
            };

            // CORREÇÃO 1 (continuação): Ajuste na concatenação da URL
            const apiUrl = `${API_BASE_URL}/Auth/register`; // "Auth" com 'A' maiúsculo

            // DEBUG: Logar a URL e os dados antes de enviar
            console.log("Enviando requisição para:", apiUrl);
            console.log("Dados enviados:", JSON.stringify(userData, null, 2));

            const response = await axios.post(apiUrl, userData, {
                headers: {
                    // CORREÇÃO 2: Corrigir erro de digitação
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                Alert.alert("Sucesso", "Registro realizado com sucesso. Faça login.", [
                    { text: "OK", onPress: () => router.push("..") }
                ]);
            } else {
                // Este else pode não ser alcançado se o Axios lançar erro para status não-2xx
                Alert.alert("Erro", response.data?.message || `Erro ao registrar (Status: ${response.status}).`);
            }
        } catch (error: any) {
            console.error("Erro no registro (catch):", error.isAxiosError ? JSON.stringify(error.toJSON(), null, 2) : error);
            if (error.response) {
                // O servidor respondeu com um status de erro (4xx, 5xx)
                console.error("Dados do erro da API:", error.response.data);
                console.error("Status do erro da API:", error.response.status);
                console.error("Cabeçalhos do erro da API:", error.response.headers);
                Alert.alert("Erro no Servidor", `Erro: ${error.response.status}. ${error.response.data?.message || 'Não foi possível completar o registro.'}`);
            } else if (error.request) {
                // A requisição foi feita mas nenhuma resposta foi recebida
                // (ex: problema de rede, servidor offline, timeout não tratado pelo Axios da mesma forma)
                console.error("Nenhuma resposta recebida:", error.request);
                Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor. Verifique sua conexão.");
            } else {
                // Algo aconteceu ao configurar a requisição que disparou um erro
                console.error("Erro ao configurar requisição:", error.message);
                Alert.alert("Erro no Aplicativo", "Ocorreu um erro ao tentar registrar: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Registro</Text>

            <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Celular" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            
            {/* Se usar TextInput para data */}
            <TextInput
                style={styles.input}
                placeholder="Data de aniversário (AAAA-MM-DD)"
                value={birthday}
                onChangeText={setBirthday}
                maxLength={10}
            />

            {/* Se usar DateTimePicker (exemplo de como integraria) */}
            {/* <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text>
                    {dateOfBirth ? formatDateForAPI(dateOfBirth) : "Data de Aniversário (AAAA-MM-DD)"}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={dateOfBirth || new Date()}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )} */}

            <TextInput style={styles.input} placeholder="Senha" secureTextEntry={true} value={password} onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="Confirmar Senha" secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} />

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