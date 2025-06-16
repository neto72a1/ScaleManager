import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode'; // Importar JwtPayload para melhor tipagem
import { Alert, ActivityIndicator, View, StyleSheet } from 'react-native';

// Interface para o payload esperado do seu JWT
// Ajuste os nomes dos campos se forem diferentes no seu token
interface DecodedToken extends JwtPayload {
  email: string;
  name: string;
  phone?: string;
  birthday?: string;
  // ASP.NET Core Identity geralmente usa este claim type para papéis.
  // Pode ser uma string única ou um array de strings.
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
  // Se você usa um claim customizado chamado "role", mantenha-o ou ajuste:
  role?: string | string[]; 
  // Adicione outros campos que você espera do token
}

interface User {
  id: string; // Geralmente 'sub' (subject) no JWT
  email: string;
  name: string;
  phone?: string;
  birthday?: string;
  roles: string[];
}

interface AuthContextProps {
  user: User | null;
  token: string | null; // Adicionar o token ao contexto pode ser útil
  signIn: (newToken: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeAndSetUser = useCallback(async (jwtToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(jwtToken);
      
      let userRoles: string[] = [];
      // Tentar obter papéis do claim padrão do ASP.NET Core Identity
      const identityRoles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (identityRoles) {
        userRoles = Array.isArray(identityRoles) ? identityRoles : [identityRoles];
      } else if (decoded.role) { // Fallback para um claim customizado "role"
        userRoles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
      }

      const userData: User = {
        id: decoded.sub || '', // 'sub' é o ID do usuário
        email: decoded.email || '',
        name: decoded.name || '', // Certifique-se que 'name' está no token
        phone: decoded.phone,
        birthday: decoded.birthday,
        roles: userRoles,
      };
      setUser(userData);
      setToken(jwtToken);
      await AsyncStorage.setItem('userToken', jwtToken);
    } catch (error) {
      console.error("Erro ao decodificar token ou definir usuário:", error);
      // Se o token for inválido, limpar
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          // Opcional: Adicionar lógica para verificar a validade/expiração do token aqui
          // Se o token estiver expirado, chame signOut() ou limpe o token.
          // Por agora, vamos assumir que se existe, tentamos decodificá-lo.
          await decodeAndSetUser(storedToken);
        }
      } catch (error) {
        console.error("Erro ao carregar o token do usuário do AsyncStorage:", error);
        // Não precisa de Alert aqui, pois é um carregamento em segundo plano
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, [decodeAndSetUser]);

  const signIn = useCallback(async (newToken: string) => {
    setIsLoading(true);
    await decodeAndSetUser(newToken);
    setIsLoading(false);
  }, [decodeAndSetUser]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setToken(null);
    } catch (error) {
        console.error("Erro ao fazer signOut:", error);
        Alert.alert("Erro", "Ocorreu um erro ao tentar sair.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext); // Correção: useContext em vez de React.useContext
  if (context === undefined) { // Correção: verificar se context é undefined
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Um fundo suave para a tela de carregamento
  },
});

export { AuthProvider, useAuth };
