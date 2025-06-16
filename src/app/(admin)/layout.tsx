import React from 'react';
import { useAuth } from "../authContexts"; // Ajuste o caminho se o seu authContexts estiver em src/app/contexts/
import { Redirect, Stack } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const AdminLayout = () => {
    const { user, isLoading, token } = useAuth(); // Obter token para verificação inicial mais robusta

    // Se ainda estiver carregando o estado de autenticação, mostre um indicador
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Verificando permissões...</Text>
            </View>
        );
    }

    // 1. Se não houver token, o usuário não está logado. Redirecionar para a tela de login.
    // Assumindo que sua tela de login principal está na rota "/" (app/index.tsx) ou "/login" (app/login.tsx)
    if (!token) {
        return <Redirect href=".." />; // Ajuste para sua rota de login principal
    }

    // 2. Se houver token, mas o objeto user não estiver carregado (improvável se token existe e isLoading é false)
    // OU se o usuário não tiver o papel "Admin".
    if (!user || !user.roles || !user.roles.includes('Admin')) {
        // Redirecionar para uma tela inicial não administrativa ou uma tela de "acesso negado".
        // Por exemplo, redirecionar para a home page principal do aplicativo.
        // Alert.alert("Acesso Negado", "Você não tem permissão para acessar esta área."); // Alert pode ser intrusivo aqui
        return <Redirect href="/" />; // Ajuste para sua rota home principal ou de acesso negado
    }

    // 3. Se o usuário estiver autenticado e for um Admin, renderiza o layout da Stack para as rotas admin
    // Este Stack irá renderizar as telas filhas dentro do grupo (admin)
    // O AdminDashboard (src/app/(admin)/index.tsx) será a tela inicial desta Stack.
    return (
        <Stack
            screenOptions={{
                headerShown: true, // Mostrar o cabeçalho
                headerStyle: { backgroundColor: '#007bff' }, // Cor de fundo do cabeçalho
                headerTintColor: '#fff', // Cor do texto e ícones do cabeçalho
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            {/* A tela 'index' dentro do grupo (admin) é o seu AdminDashboard */}
            <Stack.Screen 
                name="index" // Refere-se a app/(admin)/index.tsx
                options={{ title: 'Painel Administrativo' }} 
            />
            <Stack.Screen 
                name="users" // Refere-se a app/(admin)/users.tsx
                options={{ title: 'Gerenciar Usuários' }} 
            />
            <Stack.Screen 
                name="assign-leader" // Refere-se a app/(admin)/assign-leader.tsx
                options={{ title: 'Atribuir Líder' }} 
            />
            {/* Para o grupo 'ministries', você pode ter um header diferente ou pode aninhar outra Stack se necessário */}
            {/* Se ministries/index.tsx for a tela principal de ministérios: */}
            <Stack.Screen 
                name="ministries/index" // Refere-se a app/(admin)/ministries/index.tsx
                options={{ title: 'Gerenciar Ministérios' }} 
            />
            <Stack.Screen 
                name="ministries/create" // Refere-se a app/(admin)/ministries/create.tsx
                options={{ title: 'Criar Novo Ministério' }} 
            />
            {/* Para rotas dinâmicas como [ministryId], o título pode ser definido na própria tela ou aqui se for estático */}
            <Stack.Screen 
                name="ministries/[ministryId]/page" // Refere-se a app/(admin)/ministries/[ministryId]/page.tsx
                options={{ title: 'Detalhes do Ministério' }} 
            />
            <Stack.Screen 
                name="ministries/[ministryId]/leaders" // Refere-se a app/(admin)/ministries/[ministryId]/leaders.tsx
                options={{ title: 'Líderes do Ministério' }} 
            />
             <Stack.Screen 
                name="ministries/[ministryId]/remove" // Refere-se a app/(admin)/ministries/[ministryId]/remove.tsx
                options={{ title: 'Remover do Ministério' }} 
            />
            {/* Adicione outras Stack.Screen para configurar títulos ou opções específicas 
                para outras rotas dentro do grupo (admin) conforme necessário.
                O nome deve corresponder ao nome do arquivo/pasta da rota.
            */}
        </Stack>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5', // Um fundo para a tela de carregamento
    },
});

export default AdminLayout;