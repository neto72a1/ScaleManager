import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, FlatList, Modal, Pressable, ScrollView } from 'react-native';
import CheckBox from 'expo-checkbox';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../authContexts'; // Ajuste o caminho se necessário

// Define a URL base da sua API
const API_BASE_URL = "http://localhost:8081/api";

// --- INTERFACES DO BACKEND ---
interface UserDetailDto {
  id: string;
  userName: string;
  email: string;
  phone: string | null;
  birthday: string | null;
  roles: string[];
  ministries: MinistryAssignmentDto[];
}

interface MinistryAssignmentDto {
  id: number; // ID do MinistryAssignment no banco de dados (se existir)
  ministry: string; // Nome do ministério
  functions: string[];
}

interface AvailableMinistry {
  id: string; // ID interno usado no frontend (ex: "music", "communication")
  name: string; // Nome do ministério (ex: "Música", "Comunicação")
  functions: string[]; // Funções disponíveis para este ministério
}

// --- LISTA DE MINISTÉRIOS E FUNÇÕES DISPONÍVEIS (HARDCODED POR ENQUANTO) ---
// Idealmente, esta lista viria do backend via um endpoint /api/Admin/available-ministries-with-functions
const ALL_AVAILABLE_MINISTRIES: AvailableMinistry[] = [
  { id: "music", name: "Música", functions: ["Vocal", "Violão", "Teclado", "Guitarra", "Baixo", "Bateria", "Metais", "Percurssão", "Direção Musical"] },
  { id: "communication", name: "Comunicação", functions: ["Transmissão", "Som Transmissão", "Câmera Móvel", "Redes Sociais", "Projeção", "Som", "Fotografia"] },
  // Adicione outros ministérios e suas funções aqui
];

const ManageMinistriesScreen: React.FC = () => {
  const { userId, userName } = useLocalSearchParams<{ userId: string, userName: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [currentUser, setCurrentUser] = useState<UserDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMinistryAssignments, setSelectedMinistryAssignments] = useState<MinistryAssignmentDto[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Função para buscar os detalhes do usuário
  const fetchUserDetails = useCallback(async () => {
    if (!token || !userId) {
      setError('Token de autenticação ou ID do usuário não encontrado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Endpoint para buscar todos os usuários, e então encontrar o específico
      // Idealmente, teríamos um endpoint /api/Admin/users/{userId}
      const response = await fetch(`${API_BASE_URL}/Admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Falha ao buscar usuários.');
      }

      const data: UserDetailDto[] = await response.json();
      const user = data.find(u => u.id === userId);

      if (user) {
        setCurrentUser(user);
        // Inicializa as atribuições de ministério selecionadas
        setSelectedMinistryAssignments(user.ministries || []);
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

  // Lidar com a seleção/desseleção de um ministério
  const handleMinistrySelection = (ministryName: string, isChecked: boolean) => {
    if (isChecked) {
      // Adiciona o ministério com uma lista vazia de funções inicialmente
      setSelectedMinistryAssignments(prev => [
        ...prev,
        { id: 0, ministry: ministryName, functions: [] } // ID 0 ou um placeholder, será ignorado no backend para novas atribuições
      ]);
    } else {
      // Remove o ministério
      setSelectedMinistryAssignments(prev => prev.filter(ma => ma.ministry !== ministryName));
    }
  };

  // Lidar com a seleção/desseleção de uma função dentro de um ministério
  const handleFunctionSelection = (ministryName: string, functionName: string, isChecked: boolean) => {
    setSelectedMinistryAssignments(prev =>
      prev.map(ma => {
        if (ma.ministry === ministryName) {
          const updatedFunctions = isChecked
            ? [...ma.functions, functionName]
            : ma.functions.filter(f => f !== functionName);
          return { ...ma, functions: updatedFunctions };
        }
        return ma;
      })
    );
  };

  // Salvar as atribuições de ministério e funções atualizadas
  const handleSaveMinistriesFunctions = async () => {
    if (!currentUser || isSaving) return;

    setIsSaving(true);
    setError(null);
    setFeedbackMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Admin/users/${currentUser.id}/ministries-functions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ministries: selectedMinistryAssignments })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Falha ao atualizar ministérios e funções.');
      }

      const data = await response.json();
      setFeedbackMessage(data.Message || 'Ministérios e funções atualizados com sucesso!');
      setModalVisible(false); // Fecha o modal
      await fetchUserDetails(); // Recarrega os detalhes do usuário
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido ao atualizar ministérios e funções.');
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
        <Text style={styles.errorText}>Nenhum usuário encontrado para gerenciar ministérios.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome5 name="arrow-left" size={18} color="#007AFF" />
        <Text style={styles.backButtonText}> Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Gerenciar Ministérios e Funções</Text>
      <Text style={styles.subtitle}>Usuário: {userName || currentUser.userName}</Text>

      {currentUser.ministries && currentUser.ministries.length > 0 ? (
        <View style={styles.currentAssignmentsContainer}>
          <Text style={styles.currentAssignmentsTitle}>Atribuições Atuais:</Text>
          {currentUser.ministries.map((ma, index) => (
            <View key={ma.id || index} style={styles.currentMinistryItem}>
              <Text style={styles.currentMinistryName}>- {ma.ministry}</Text>
              {ma.functions && ma.functions.length > 0 && (
                <Text style={styles.currentMinistryFunctions}>
                  Funções: {ma.functions.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noAssignmentsText}>Nenhuma atribuição de ministério encontrada.</Text>
      )}

      <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
        <FontAwesome5 name="edit" size={18} color="#fff" />
        <Text style={styles.editButtonText}> Editar Ministérios</Text>
      </TouchableOpacity>

      {feedbackMessage && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      )}

      {/* Modal para seleção de ministérios e funções */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecionar Ministérios e Funções</Text>
            <ScrollView style={styles.modalScrollView}>
              {ALL_AVAILABLE_MINISTRIES.map((ministry) => (
                <View key={ministry.id} style={styles.ministryCheckboxGroup}>
                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      value={selectedMinistryAssignments.some(ma => ma.ministry === ministry.name)}
                      onValueChange={(newValue) => handleMinistrySelection(ministry.name, newValue)}
                      color={selectedMinistryAssignments.some(ma => ma.ministry === ministry.name) ? '#007AFF' : undefined}
                    />
                    <Text style={styles.checkboxLabel}>{ministry.name}</Text>
                  </View>

                  {selectedMinistryAssignments.some(ma => ma.ministry === ministry.name) && (
                    <View style={styles.functionsContainer}>
                      {ministry.functions.map((func) => (
                        <View key={func} style={styles.checkboxContainer}>
                          <CheckBox
                            value={selectedMinistryAssignments.find(ma => ma.ministry === ministry.name)?.functions.includes(func) || false}
                            onValueChange={(newValue) => handleFunctionSelection(ministry.name, func, newValue)}
                            color={selectedMinistryAssignments.find(ma => ma.ministry === ministry.name)?.functions.includes(func) ? '#007AFF' : undefined}
                          />
                          <Text style={styles.checkboxLabel}>{func}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveMinistriesFunctions}
                disabled={isSaving}
              >
                <Text style={styles.modalButtonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setSelectedMinistryAssignments([...(currentUser?.ministries || [])]); // Reseta para os originais
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
  currentAssignmentsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  currentAssignmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  currentMinistryItem: {
    marginLeft: 10,
    marginBottom: 5,
  },
  currentMinistryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5a6268',
  },
  currentMinistryFunctions: {
    fontSize: 13,
    color: '#6c757d',
    marginLeft: 10,
  },
  noAssignmentsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17a2b8', // Cor azul-claro para "Editar Ministérios"
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
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#155724',
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
    width: '90%', // Ajusta a largura do modal
    maxHeight: '80%', // Limita a altura do modal para scroll
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  modalScrollView: {
    width: '100%',
    maxHeight: '70%', // Limita a altura do conteúdo rolável
  },
  ministryCheckboxGroup: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#495057',
  },
  functionsContainer: {
    marginLeft: 25, // Indentação para as funções
    marginTop: 5,
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
    backgroundColor: '#28a745',
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ManageMinistriesScreen;