import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles/homeScreenStyle'; // Assumindo que você tem um arquivo de estilos

const HomeScreen = () => {
    const router = useRouter();
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const loadUserName = async () => {
            // Assumindo que você armazenou o nome do usuário ao fazer login
            const name = await AsyncStorage.getItem('userName');
            setUserName(name);
        };

        loadUserName();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem Vindo(a){userName ? ` ${userName}` : ''} ao Escalas Ibira!</Text>
            <Button
                title="Minha Disponibilidade"
                onPress={() => router.navigate("./userAvailabilityScreen")}
            />
            <Button
                title="Visualizar Escalas"
                onPress={() => router.navigate("./scaleScreen")}
            />
            {/* Outros botões */}
        </View>
    );
};

export default HomeScreen;