import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, FlatList, Modal, Pressable } from 'react-native';
import CheckBox from 'expo-checkbox';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Para acessar parâmetros de rota
import { FontAwesome5 } from '@expo/vector-icons'; // Para ícones
import { useAuth } from '../../authContexts'; // Ajuste o caminho se necessário

// Define a URL base da sua API
const API_BASE_URL = "http://localhost:8081/api";

// Define as interfaces para os DTOs do backend
interface UserDetailDto {
  id: string;
  userName: string;
  email: string;
  phone: string | null;
  birthday: string | null; // Assumindo string ISO para data
  roles: string[];
  ministries: MinistryAssignmentDto[];
}

interface MinistryAssignmentDto {
  id: number;
  ministry: string;
  functions: string[];
}

// Assumindo que você tenha uma lista de todos os papéis disponíveis no sistema
const ALL_AVAILABLE_ROLES = ['Admin', 'leader', 'member']; // Ajuste conforme seus papéis reais

const ManageRolesScreen: React.FC = () => {
  const { userId, userName } = useLocalSearchParams<{ userId: string, userName: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [currentUser, setCurrentUser] = useState<UserDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Função para buscar os detalhes do usuário específico
  const fetchUserDetails = useCallback(async () => {
    if (!token || !userId) {
      setError('Token de autenticação ou ID do usuário não encontrado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Admin/users`, { // O endpoint GetUsers retorna todos os usuários.
                                                                     // Idealmente, teríamos um endpoint GetUserById: /Admin/users/{userId}
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Falha ao buscar usuários.');
      }

      const data: UserDetailDto[] = await response.json();
      const user = data.find(u => u.id === userId); // Encontra o usuário pelo ID

      if (user) {
        setCurrentUser(user);
        setSelectedRoles([...user.roles]); // Inicializa os papéis selecionados
      } else {
        setError('Usuário não encontrado na lista.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido ao buscar detalhes do usuário.');
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Lidar com a seleção/desseleção de papéis
  const handleRoleChange = (role: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  // Salvar os papéis atualizados
  const handleSaveRoles = async () => {
    if (!currentUser || isSaving) return;

    setIsSaving(true);
    setError(null);
    setFeedbackMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Admin/users/${currentUser.id}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roles: selectedRoles })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Falha ao atualizar papéis.');
      }

      const data = await response.json();
      setFeedbackMessage(data.Message || 'Papéis atualizados com sucesso!');
      setModalVisible(false); // Fecha o modal
      await fetchUserDetails(); // Recarrega os detalhes do usuário para mostrar as mudanças
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido ao atualizar papéis.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando detalhes do usuário...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserDetails}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Nenhum usuário encontrado para gerenciar papéis.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome5 name="arrow-left" size={18} color="#007AFF" />
        <Text style={styles.backButtonText}> Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Gerenciar Papéis</Text>
      <Text style={styles.subtitle}>Usuário: {userName || currentUser.userName}</Text>
      <Text style={styles.currentRolesText}>
        Papéis Atuais: {currentUser.roles.length > 0 ? currentUser.roles.join(', ') : 'Nenhum'}
      </Text>

      <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
        <FontAwesome5 name="edit" size={18} color="#fff" />
        <Text style={styles.editButtonText}> Editar Papéis</Text>
      </TouchableOpacity>

      {feedbackMessage && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      )}

      {/* Modal para seleção de papéis */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecionar Papéis</Text>
            <FlatList
              data={ALL_AVAILABLE_ROLES}
              keyExtractor={(item) => item}
              renderItem={({ item: role }) => (
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={selectedRoles.includes(role)}
                    onValueChange={(newValue) => handleRoleChange(role, newValue)}
                    color={selectedRoles.includes(role) ? '#007AFF' : undefined}
                  />
                  <Text style={styles.checkboxLabel}>{role}</Text>
                </View>
              )}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveRoles}
                disabled={isSaving}
              >
                <Text style={styles.modalButtonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setSelectedRoles([...currentUser.roles]); // Reseta para os papéis originais
                  setModalVisible(false);
                  setError(null); // Limpa erros do modal
                }}
                disabled={isSaving}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#343a40',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#495057',
    marginBottom: 15,
    textAlign: 'center',
  },
  currentRolesText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#d4edda', // Verde claro para sucesso
    borderColor: '#28a745',
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#155724', // Verde escuro
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Ajusta a largura do modal
    maxHeight: '70%', // Limita a altura do modal para scroll
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%', // Garante que o checkbox ocupe a largura total
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#495057',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  modalSaveButton: {
    backgroundColor: '#28a745', // Verde para salvar
  },
  modalCancelButton: {
    backgroundColor: '#6c757d', // Cinza para cancelar
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ManageRolesScreen;