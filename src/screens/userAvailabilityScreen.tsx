import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Calendar, CalendarProps, DateData } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { styles } from './styles/userAvailabilityScreenStyle';

interface MarkedDates {
    [key: string]: {
        marked?: boolean;
        dotColor?: string;
        selected?: boolean;
        color?: string;
        textColor?: string;
    };
}

const API_BASE_URL = "http://localhost:8081/api";

const UserAvailabilityScreen = () => {
    const [leaderAvailability, setLeaderAvailability] = useState<MarkedDates>({});
    const [userAvailability, setUserAvailability] = useState<MarkedDates>({});
    const [token, setToken] = useState<string | null>(null);

    const fetchUserAvailability = async () => { // Declarando a função fora do useEffect
        if (token) {
            try {
                const response = await axios.get(`${API_BASE_URL}/availability/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    const marked: MarkedDates = {};
                    response.data.forEach((date: string) => {
                        marked[date] = { selected: true, color: 'orange', textColor: 'white' };
                    });
                    setUserAvailability(marked);
                } else {
                    Alert.alert("Erro", "Falha ao carregar sua disponibilidade.");
                }
            } catch (error) {
                console.error("Erro ao carregar sua disponibilidade:", error);
                Alert.alert("Erro", "Ocorreu um erro ao carregar sua disponibilidade.");
            }
        }
    };

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await AsyncStorage.getItem('userToken');
            setToken(storedToken);
        };

        loadToken();
    }, []);

    useEffect(() => {
        fetchUserAvailability(); // Chamada inicial da função
    }, [token]);

    const fetchLeaderAvailability = async () => {
        if (token) {
            try {
                const response = await axios.get(`${API_BASE_URL}/availability/general`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    const marked: MarkedDates = {};
                    response.data.forEach((date: string) => {
                        marked[date] = { marked: true, dotColor: 'green' };
                    });
                    setLeaderAvailability(marked);
                } else {
                    Alert.alert("Erro", "Falha ao carregar a disponibilidade geral.");
                }
            } catch (error) {
                console.error("Erro ao carregar disponibilidade geral:", error);
                Alert.alert("Erro", "Ocorreu um erro ao carregar a disponibilidade geral.");
            }
        }
    };

    useEffect(() => {
        fetchLeaderAvailability();
    }, [token]);

    const handleDayPress = (day: DateData) => {
        const dateStr = day.dateString;
        const isLeaderAvailable = leaderAvailability[dateStr]?.marked;

        if (isLeaderAvailable) {
            const newUserAvailability = { ...userAvailability };
            if (newUserAvailability[dateStr]) {
                delete newUserAvailability[dateStr]; // Desmarca se já estiver selecionado
            } else {
                newUserAvailability[dateStr] = { selected: true, color: 'orange', textColor: 'white' }; // Marca como disponível pelo usuário
            }
            setUserAvailability(newUserAvailability);
        } else {
            Alert.alert('Aviso', 'Você só pode selecionar datas definidas pelos líderes.');
        }
    };

    const handleSaveUserAvailability = async () => {
        if (!token) {
            Alert.alert("Autenticação", "Você precisa estar logado para salvar sua disponibilidade.");
            return;
        }

        const selectedUserDates = Object.keys(userAvailability).filter(date => userAvailability[date]?.selected);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/availability/user`,
                { dates: selectedUserDates },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Sucesso", "Sua disponibilidade foi salva com sucesso.");
                // Recarrega a disponibilidade do usuário para atualizar a UI
                fetchUserAvailability(); // Chamando a função agora no escopo correto
            } else {
                Alert.alert("Erro", response.data?.message || "Erro ao salvar sua disponibilidade.");
            }
        } catch (error) {
            console.error("Erro ao salvar disponibilidade do usuário:", error);
            Alert.alert("Erro", "Ocorreu um erro ao salvar sua disponibilidade.");
        }
    };

    const combinedMarkedDates = { ...leaderAvailability, ...userAvailability };

    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={32} color="#ccc" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Minha Disponibilidade</Text>
            <Text style={styles.infoText}>Selecione as datas em que você está disponível (marcadas em verde pelos líderes).</Text>
            <Calendar
                markedDates={combinedMarkedDates}
                onDayPress={handleDayPress}
                monthFormat={'MMMM<0xC8><0x98>'}
                firstDay={1}
                onPressArrowLeft={(subtractMonth: () => void) => subtractMonth()}
                onPressArrowRight={(addMonth: () => void) => addMonth()}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveUserAvailability}>
                <Text style={styles.saveButtonText}>Salvar Minha Disponibilidade</Text>
            </TouchableOpacity>
        </View>
    );
};

export default UserAvailabilityScreen;