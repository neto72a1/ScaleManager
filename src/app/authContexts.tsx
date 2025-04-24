import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Alert, ActivityIndicator, View } from 'react-native'; // Importe ActivityIndicator

interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    birthday?: string;
    roles: string[];
}

interface AuthContextProps {
    user: User | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => void;
    isLoading: boolean; // Adicione o estado de carregamento
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Inicialmente, estamos carregando

    // Função para decodificar o token e obter os dados do usuário
    const decodeToken = (token: string): User => {
        const decoded: any = jwtDecode(token); // Use 'any' para evitar erros de tipo
        return {
            id: decoded.sub, // 'sub' é comumente usado para o ID do usuário em JWT
            email: decoded.email,
            name: decoded.name,
            phone: decoded.phone,
            birthday: decoded.birthday,
            roles: decoded.role || [], // Assumindo que as roles estão em 'role'
        };
    };

    // Carregar o usuário do AsyncStorage na inicialização
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    const decodedUser = decodeToken(token);
                    setUser(decodedUser);
                }
            } catch (error) {
                console.error("Erro ao carregar o usuário:", error);
                Alert.alert("Erro", "Ocorreu um erro ao carregar suas informações. Por favor, tente novamente.");
            } finally {
                setIsLoading(false); // Defina o estado de carregamento como falso após a tentativa
            }
        };
        loadUser();
    }, []);

    // Função para fazer login e salvar o token
    const signIn = useCallback(async (token: string) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            const decodedUser = decodeToken(token);
            setUser(decodedUser);
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            Alert.alert("Erro", "Ocorreu um erro ao fazer login. Por favor, tente novamente.");
        }
    }, []);

    // Função para fazer logout e remover o token
    const signOut = useCallback(() => {
        AsyncStorage.removeItem('userToken').then(() => {
            setUser(null);
        });
    }, []);

    if (isLoading) {
        // Mostrar um indicador de carregamento enquanto carrega o usuário
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const contextValue = {
        user,
        signIn,
        signOut,
        isLoading,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuth };
