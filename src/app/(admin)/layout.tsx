import React from 'react';
import { useAuth } from "../authContexts";
import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

const AdminLayout = () => {
    const { user, isLoading } = useAuth();

    // Se ainda estiver carregando, mostre um indicador
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    // Redirecionar se não estiver autenticado ou não for um Admin
    if (!user || !user.roles.includes('Admin')) {
        Redirect({href: "./index"}); // Redirecione para a página de login
        return null; // Renderiza nulo para evitar o erro "Cannot update a component from inside the function body of a different component"
    }

    // Se o usuário estiver autenticado e for um Admin, renderiza o layout administrativo
    return (
        <View>
            <Text>Admin Layout</Text>
            {/* Coloque aqui o conteúdo do seu layout administrativo, como a barra de navegação */}
            {/* Por exemplo: */}
            {/* <AdminNavBar /> */}
            {/* Renderize as rotas filhas aqui */}
        </View>
    );
};

export default AdminLayout;