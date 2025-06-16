import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useGlobalSearchParams, useRouter, Link } from 'expo-router';
import { useAuth } from '../../../authContexts'; // Ajuste o caminho conforme sua estrutura
import { FontAwesome5 } from '@expo/vector-icons';

const API_BASE_URL = "http://localhost:8081/api";

interface LeaderInfo { // Para buscar informações do líder a ser removido (opcional)
    id: string;
    userName: string;
    email: string;
}

interface MinistryInfo { // Para buscar informações do ministério (opcional)
    id: number;
    name: string;
}


const RemoveLeaderScreen = () => {
    const params = useGlobalSearchParams<{ ministryId?: string; leaderId?: string; leaderName?: string; ministryName?: string }>();
    const ministryId = params.ministryId;
    const leaderId = params.leaderId;
    // Opcional: Obter nomes da navegação para melhor UX, ou buscar na API
    const initialLeaderName = params.leaderName || `ID: ${leaderId}`;
    const initialMinistryName = params.ministryName || `ID: ${ministryId}`;


    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para nomes (se buscar na API)
    const [displayLeaderName, setDisplayLeaderName] = useState(initialLeaderName);
    const [displayMinistryName, setDisplayMinistryName] = useState(initialMinistryName);


    const { token } = useAuth();
    const router = useRouter();

    // Opcional: Efeito para buscar nomes se não forem passados ou para confirmar
    useEffect(() => {
        // Se os nomes não foram passados como params, ou para confirmar, você pode buscá-los.
        // Por simplicidade, vamos assumir que os nomes passados via params são suficientes
        // ou que o usuário já tem o contexto da tela anterior.
        // Se precisar buscar:
        // async function fetchData() {
        //   if (token && ministryId && !params.ministryName) {
        //     // fetch ministry name
        //   }
        //   if (token && leaderId && !params.leaderName) {
        //     // fetch leader name/details
        //   }
        // }
        // fetchData();
        if (leaderId) setDisplayLeaderName(params.leaderName || `ID: ${leaderId}`);
        if (ministryId) setDisplayMinistryName(params.ministryName || `ID: ${ministryId}`);

    }, [ministryId, leaderId, params.leaderName, params.ministryName, token]);


    const handleConfirmRemove = async () => {
        if (!ministryId || !leaderId) {
            Alert.alert("Erro", "Informações de ministério ou líder ausentes.");
            return;
        }
        if (!token) {
            Alert.alert("Erro de Autenticação", "Não foi possível autenticar. Tente fazer login novamente.");
            return;
        }

        setLoading(true);
        setMessage('');
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/Admin/remove-leader`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    userId: leaderId, 
                    ministryId: parseInt(ministryId, 10) 
                }),
            });

            const responseData = await response.json();

            if (response.ok) {
                Alert.alert("Sucesso", responseData.message || "Líder removido com sucesso do ministério.");
                // Navega de volta para a lista de líderes daquele ministério
                // Usando replace para que o usuário não possa voltar para a tela de remoção
                router.replace({ 
                    pathname: "/(admin)/ministries/[ministryId]/leaders", 
                    params: { ministryId: ministryId } 
                });
            } else {
                setError(responseData.message || responseData.title || `Erro ao remover líder: ${response.status}`);
                Alert.alert("Erro", responseData.message || responseData.title || `Erro ao remover líder: ${response.status}`);
            }
        } catch (err: any) {
            setError(`Erro na requisição: ${err.message}`);
            Alert.alert("Erro na Requisição", `Ocorreu um erro: ${err.message}`);
            console.error("Erro ao remover líder:", err);
        } finally {
            setLoading(false);
        }
    };

    const showConfirmationAlert = () => {
        Alert.alert(
            "Confirmar Remoção",
            `Tem certeza que deseja remover o líder "${displayLeaderName}" do ministério "${displayMinistryName}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Remover", style: "destructive", onPress: handleConfirmRemove }
            ]
        );
    };

    if (!ministryId || !leaderId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Erro: Informações de líder ou ministério inválidas ou não fornecidas.</Text>
                <Link href="/(admin)/ministries/page" asChild style={styles.linkButton}>
                     <TouchableOpacity><Text style={styles.linkText}>Voltar para Ministérios</Text></TouchableOpacity>
                </Link>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Remover Líder</Text>
            <Text style={styles.confirmationText}>
                Você está prestes a remover o líder:
            </Text>
            <Text style={styles.detailText}><Text style={styles.bold}>Líder:</Text> {displayLeaderName}</Text>
            <Text style={styles.detailText}><Text style={styles.bold}>Do Ministério:</Text> {displayMinistryName}</Text>
            
            {loading ? (
                <ActivityIndicator size="large" color="#dc3545" style={{ marginVertical: 20 }}/>
            ) : (
                <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={showConfirmationAlert}>
                    <FontAwesome5 name="user-times" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Confirmar Remoção</Text>
                </TouchableOpacity>
            )}

            {message && <Text style={message.startsWith("Erro") ? styles.errorText : styles.successMessage}>{message}</Text>}
            {error && !message && <Text style={styles.errorText}>{error}</Text>} 
            
            {/* O botão de voltar é geralmente tratado pelo header do Stack, mas um link explícito pode ser útil */}
            <Link 
                href={{ 
                    pathname: "/(admin)/ministries/[ministryId]/leaders", 
                    params: { ministryId: ministryId } 
                }} 
                asChild 
                style={styles.linkButton}
            >
                <TouchableOpacity>
                    <FontAwesome5 name="arrow-left" size={16} color="#007bff" />
                    <Text style={styles.linkText}> Voltar para Líderes do Ministério</Text>
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
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#343a40',
        textAlign: 'center',
    },
    confirmationText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        color: '#495057',
    },
    detailText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
        color: '#495057',
    },
    bold: {
        fontWeight: 'bold',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginVertical: 20,
        width: '80%',
    },
    removeButton: {
        backgroundColor: '#dc3545', // Vermelho
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    message: {
        marginTop: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    successMessage: {
        color: '#28a745', // Verde para sucesso
    },
    errorText: {
        color: '#dc3545', // Vermelho para erro
        textAlign: 'center',
        fontSize: 16,
        marginBottom:10,
    },
    linkButton: {
        marginTop: 20,
        paddingVertical: 10,
    },
    linkText: {
        color: '#007bff',
        textAlign: 'center',
        fontSize: 16,
        marginLeft: 5,
    },
});

export default RemoveLeaderScreen;
