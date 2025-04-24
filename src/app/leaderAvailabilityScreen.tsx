import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Importe o Picker para selecionar o ministério

import { styles } from './styles/leaderAvailabilityScreenStyle';

const API_BASE_URL = "http://192.168.100.73:8081/api";

interface MarkedDates {
    [key: string]: {
        selected?: boolean;
        marked?: boolean;
        dotColor?: string;
        color?: string;
        textColor?: string;
    };
}

interface DayProps {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
}

interface Ministry {
    id: number;
    name: string;
}

const LeaderAvailabilityScreen = () => {
    const [markedDates, setMarkedDates] = useState<MarkedDates>({});
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [selectedMinistryId, setSelectedMinistryId] = useState<number | null>(null);

    useEffect(() => {
        const loadTokenAndMinistries = async () => {
            const storedToken = await AsyncStorage.getItem('userToken');
            setToken(storedToken);
            if (storedToken) {
                fetchLeaderMinistries(storedToken);
            }
        };

        loadTokenAndMinistries();
    }, []);

    const fetchLeaderMinistries = async (authToken: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/ministries/leader`, { // Endpoint para buscar ministérios do líder
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (response.status === 200) {
                setMinistries(response.data);
                if (response.data.length > 0 && selectedMinistryId === null) {
                    setSelectedMinistryId(response.data[0].id); // Seleciona o primeiro ministério por padrão
                }
            } else {
                Alert.alert("Erro", "Falha ao carregar seus ministérios.");
            }
        } catch (error) {
            console.error("Erro ao carregar seus ministérios:", error);
            Alert.alert("Erro", "Ocorreu um erro ao carregar seus ministérios.");
        }
    };

    const handleDayPress = (day: DayProps) => {
        const dateStr = day.dateString;
        if (selectedDates.includes(dateStr)) {
            const newSelectedDates = selectedDates.filter(date => date !== dateStr);
            setSelectedDates(newSelectedDates);
            const newMarkedDates = { ...markedDates };
            delete newMarkedDates[dateStr];
            setMarkedDates(newMarkedDates);
        } else {
            setSelectedDates([...selectedDates, dateStr]);
            setMarkedDates({
                ...markedDates,
                [dateStr]: { selected: true, color: 'blue', textColor: 'white' },
            });
        }
    };

    const handleSaveAvailability = async () => {
        if (!token) {
            Alert.alert("Autenticação", "Você precisa estar logado para salvar a disponibilidade.");
            return;
        }

        if (!selectedMinistryId) {
            Alert.alert("Aviso", "Selecione um ministério.");
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/availability/general`,
                { dates: selectedDates, ministryId: selectedMinistryId }, // Envia o ministryId
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Sucesso", "Disponibilidade definida com sucesso para o ministério selecionado.");
                setSelectedDates([]);
                setMarkedDates({});
            } else {
                Alert.alert("Erro", response.data?.message || "Erro ao salvar a disponibilidade.");
            }
        } catch (error) {
            console.error("Erro ao salvar disponibilidade geral:", error);
            Alert.alert("Erro", "Ocorreu um erro ao salvar a disponibilidade.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Definir Disponibilidade do Mês</Text>

            {ministries.length > 0 && (
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Ministério:</Text>
                    <Picker
                        selectedValue={selectedMinistryId}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedMinistryId(itemValue as number)}
                    >
                        {ministries.map((ministry) => (
                            <Picker.Item key={ministry.id} label={ministry.name} value={ministry.id} />
                        ))}
                    </Picker>
                </View>
            )}

            <Calendar
                markedDates={markedDates}
                onDayPress={handleDayPress}
                monthFormat={'MMMM<0xC8><0x98>'}
                firstDay={1}
                onPressArrowLeft={(subtractMonth: () => void) => subtractMonth()}
                onPressArrowRight={(addMonth: () => void) => addMonth()}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAvailability}>
                <Text style={styles.saveButtonText}>Salvar Disponibilidade</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LeaderAvailabilityScreen;