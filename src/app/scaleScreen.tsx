import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Calendar, CalendarProps, DateData } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { styles } from './styles/scaleScreenStyle'; // Ajuste o caminho se necessário

interface MarkedDates {
    [key: string]: {
        marked?: boolean;
        dotColor?: string;
        activeOpacity?: number;
        selected?: boolean;
        selectedColor?: string;
        selectedTextColor?: string;
    };
}

interface ScheduleData {
    [ministry: string]: string[];
}

const API_BASE_URL = "http://localhost:8081/api";

const ScaleScreen = () => {
    const [markedUserDates, setMarkedUserDates] = useState<MarkedDates>({});
    const [scheduleData, setScheduleData] = useState<ScheduleData>({});
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await AsyncStorage.getItem('userToken');
            setToken(storedToken);
        };

        loadToken();
    }, []);

    useEffect(() => {
        const fetchUserScheduleDays = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/schedule/user`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.status === 200) {
                        const scheduledDays: string[] = response.data;
                        const marked: MarkedDates = {};
                        scheduledDays.forEach(day => {
                            marked[day] = { marked: true, dotColor: 'blue', activeOpacity: 0 };
                        });
                        setMarkedUserDates(marked);
                        const today = new Date().toISOString().split('T')[0];
                        setSelectedDay(today);
                        loadScheduleForDate(today);
                    } else {
                        Alert.alert("Erro", "Falha ao carregar sua escala.");
                    }
                } catch (error) {
                    console.error("Erro ao carregar sua escala:", error);
                    Alert.alert("Erro", "Ocorreu um erro ao carregar sua escala.");
                }
            }
        };

        fetchUserScheduleDays();
    }, [token]);

    const loadScheduleForDate = async (date: string) => {
        if (token) {
            try {
                const response = await axios.get(`${API_BASE_URL}/schedule/date/${date}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.status === 200) {
                    setScheduleData(response.data);
                } else {
                    setScheduleData({});
                    Alert.alert("Aviso", response.data?.message || "Nenhuma escala encontrada para este dia.");
                }
            } catch (error) {
                console.error(`Erro ao carregar escala para ${date}:`, error);
                Alert.alert("Erro", "Ocorreu um erro ao carregar a escala para este dia.");
            }
        }
    };

    const handleDayPress = (day: DateData) => {
        const dateStr = day.dateString;
        setSelectedDay(dateStr);
        loadScheduleForDate(dateStr);
    };

    const renderScheduleItem = ({ item: [ministry, members] }: { item: [string, string[]] }) => (
        <View style={styles.scheduleItem}>
            <Text style={styles.teamName}>{ministry}</Text>
            <Text style={styles.members}>{members.join(', ')}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Minha Escala</Text>
            <View>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={32} color="#ccc" />
                </TouchableOpacity>
            </View>

            <Calendar
                markedDates={{
                    ...markedUserDates,
                    [selectedDay]: { selected: true, marked: markedUserDates.hasOwnProperty(selectedDay), selectedColor: 'lightblue', selectedTextColor: 'black' },
                }}
                onDayPress={handleDayPress}
                monthFormat={'MMMM<0xC8><0x98>'}
                firstDay={1}
                onPressArrowLeft={(subtractMonth: () => void) => subtractMonth()}
                onPressArrowRight={(addMonth: () => void) => addMonth()}
                style={styles.calendar}
                theme={{
                    selectedDayBackgroundColor: 'blue',
                    selectedDayTextColor: '#fff',
                    todayTextColor: '#00adf5',
                    dotColor: 'blue',
                }}
            />

            <Text style={styles.subtitle}>Escala para {selectedDay}:</Text>
            {Object.keys(scheduleData).length > 0 ? (
                <FlatList
                    data={Object.entries(scheduleData)}
                    renderItem={renderScheduleItem}
                    keyExtractor={(item) => item[0]}
                />
            ) : (
                <Text style={styles.noSchedule}>Nenhuma escala definida para este dia.</Text>
            )}
        </ScrollView>
    );
};

export default ScaleScreen;