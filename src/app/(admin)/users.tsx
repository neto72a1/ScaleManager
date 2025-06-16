import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Button, Alert } from 'react-native';
import { useAuth } from '../authContexts'; // Ajuste o caminho se necessário
import { Link, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons'; // Para ícones

// Defina sua API_BASE_URL. Idealmente, importe de um arquivo de configuração.
const API_BASE_URL = "http://localhost:8081/api";

// --- NOVA INTERFACE PARA MINISTRYASSIGNMENT ---
interface MinistryAssignment {
    id: number; // Ou string, dependendo do tipo no seu backend
    ministry: string;
    functions: string[];
}

// --- INTERFACE USER ATUALIZADA ---
interface User {
    id: string;
    userName: string;
    email: string;
    phone?: string; // Adicionado
    birthday?: string; // Adicionado (Assumindo AAAA-MM-DD)
    roles?: string[]; // Opcional: se sua API de listagem de usuários retornar papéis
    ministries?: MinistryAssignment[]; // Adicionado
}

const UserListScreen = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();
    const router = useRouter();

    const fetchUsers = useCallback(async () => {
        if (!token) {
            setError("Usuário não autenticado. Token não encontrado.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Admin/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                let errorMessage = `Erro ao buscar usuários: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.title || errorMessage;
                } catch (e) { /* Ignorar */ }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            console.error("Falha ao buscar usuários:", err);
            setError(err.message || "Ocorreu um erro desconhecido.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!token) {
            Alert.alert("Erro", "Não autenticado.");
            return;
        }
        Alert.alert(
            "Confirmar Exclusão",
            `Tem certeza que deseja excluir o usuário "${userName}" (ID: ${userId})? Esta ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true); // Pode ser um loading específico para a exclusão
                        try {
                            const response = await fetch(`${API_BASE_URL}/Admin/users/${userId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            if (!response.ok) {
                                let errorMessage = `Erro ao excluir usuário: ${response.status}`;
                                try {
                                    const errorData = await response.json();
                                    errorMessage = errorData.message || errorData.title || errorMessage;
                                } catch (e) { /* Ignorar */ }
                                throw new Error(errorMessage);
                            }
                            Alert.alert("Sucesso", `Usuário "${userName}" excluído com sucesso.`);
                            fetchUsers(); // Recarregar a lista de usuários
                        } catch (err: any) {
                            Alert.alert("Erro", err.message || "Não foi possível excluir o usuário.");
                            console.error("Erro ao excluir usuário:", err);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleManageRoles = (userId: string, userName: string) => {
        router.push({
            pathname: `./users/manageRoles`,
            params: { userId, userName }
        });
        // Alert.alert("Gerenciar Papéis", `Implementar tela para gerenciar papéis do usuário: ${userName} (ID: ${userId})`);
    };

    // --- NOVA FUNÇÃO PARA GERENCIAR MINISTÉRIOS E FUNÇÕES ---
    const handleManageMinistriesFunctions = (userId: string, userName: string) => {
        router.push({
            pathname: `./users/manageMinistries`,
            params: { userId, userName }
        });
        // Alert.alert("Gerenciar Ministérios", `Implementar tela para gerenciar ministérios e funções do usuário: ${userName} (ID: ${userId})`);
    };

    if (loading && users.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Carregando usuários...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Erro ao carregar usuários: {error}</Text>
                <Button title="Tentar Novamente" onPress={fetchUsers} color="#007AFF" />
            </View>
        );
    }

    const renderUserItem = ({ item }: { item: User }) => (
        <View style={styles.listItem}>
            <View style={styles.userInfo}>
                <Text style={styles.itemTextName}>{item.userName}</Text>
                <Text style={styles.itemTextEmail}>{item.email}</Text>
                {item.phone && <Text style={styles.itemTextDetail}>Celular: {item.phone}</Text>}
                {item.birthday && <Text style={styles.itemTextDetail}>Aniversário: {item.birthday}</Text>}
                {item.roles && item.roles.length > 0 && (
                    <Text style={styles.itemTextDetail}>Papéis: {item.roles.join(', ')}</Text>
                )}

                {item.ministries && item.ministries.length > 0 && (
                    <View style={styles.ministriesContainer}>
                        <Text style={styles.ministriesTitle}>Ministérios:</Text>
                        {item.ministries.map((ma, index) => (
                            <View key={ma.id || index} style={styles.ministryItem}>
                                <Text style={styles.ministryName}>- {ma.ministry}</Text>
                                {ma.functions && ma.functions.length > 0 && (
                                    <Text style={styles.ministryFunctions}>
                                        Funções: {ma.functions.join(', ')}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                <Text style={styles.itemTextId}>ID: {item.id}</Text>
            </View>
            <View style={styles.actionsContainer}>
                {/* Botão de Gerenciar Ministérios e Funções */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.manageMinistriesButton]}
                    onPress={() => handleManageMinistriesFunctions(item.id, item.userName)}
                    disabled={loading}
                >
                    <FontAwesome5 name="hands-helping" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}> Ministérios</Text>
                </TouchableOpacity>

                {/* Botão de Gerenciar Papéis */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.manageRolesButton]}
                    onPress={() => handleManageRoles(item.id, item.userName)}
                    disabled={loading}
                >
                    <FontAwesome5 name="user-shield" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}> Papéis</Text>
                </TouchableOpacity>

                {/* Botão de Deletar Usuário */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(item.id, item.userName)}
                    disabled={loading}
                >
                    <FontAwesome5 name="trash-alt" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}> Deletar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text> : null}
                contentContainerStyle={users.length === 0 && !loading ? styles.centeredList : { paddingBottom: 20 }}
                refreshing={loading && users.length > 0}
                onRefresh={fetchUsers}
            />
            <Link href="/(admin)" asChild style={styles.backButton}>
                <TouchableOpacity>
                    <FontAwesome5 name="arrow-left" size={18} color="#007AFF" />
                    <Text style={styles.backButtonText}> Painel Admin</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f9fa',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    centeredList: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    userInfo: {
        marginBottom: 10,
    },
    itemTextName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#343a40',
    },
    itemTextEmail: {
        fontSize: 15,
        color: '#6c757d',
        marginBottom: 3,
    },
    itemTextDetail: { // Novo estilo para detalhes como celular, aniversário, papéis
        fontSize: 14,
        color: '#495057',
        marginTop: 2,
    },
    itemTextId: {
        fontSize: 13,
        color: '#adb5bd',
        marginTop: 5,
    },
    ministriesContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    ministriesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 5,
    },
    ministryItem: {
        marginLeft: 10,
        marginBottom: 3,
    },
    ministryName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#5a6268',
    },
    ministryFunctions: {
        fontSize: 12,
        color: '#6c757d',
        marginLeft: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Permite que os botões quebrem a linha se não houver espaço
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginLeft: 10,
        marginBottom: 5, // Adicionado para espaçamento vertical se quebrar a linha
    },
    manageMinistriesButton: { // Novo estilo para o botão de ministérios
        backgroundColor: '#17a2b8', // Azul-claro para gerenciar ministérios
    },
    manageRolesButton: {
        backgroundColor: '#ffc107', // Amarelo para gerenciar papéis
    },
    deleteButton: {
        backgroundColor: '#dc3545', // Vermelho para deletar
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '500',
        marginLeft: 6,
        fontSize: 14,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#f8f9fa',
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    }
});

export default UserListScreen;