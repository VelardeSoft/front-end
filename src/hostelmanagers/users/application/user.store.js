import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { UsersApi } from "../infrastructure/user-api.js";
import { UsersAssembler } from "../infrastructure/user.assembler.js";
import { User } from "../domain/model/user.entity.js";

const usersApi = new UsersApi();

const useUsersStore = defineStore('users', () => {
    const users = ref([]);
    const currentUser = ref(null);
    const errors = ref([]);
    const loading = ref(false);

    // Inicializar usuario desde localStorage inmediatamente
    const initializeUser = () => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            try {
                currentUser.value = JSON.parse(userJson);
                console.log("Usuario inicializado desde localStorage:", currentUser.value);
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
                localStorage.removeItem('currentUser');
            }
        }
    };

    // Llamar inmediatamente al definir el store
    initializeUser();

    const fetchUsers = async () => {
        loading.value = true;
        try {
            const response = await usersApi.getUsers();
            users.value = UsersAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const login = async ({ email, password }) => {
        loading.value = true;
        try {
            // Buscar usuario localmente o usando la fake API
            const response = await usersApi.getUsers();
            const allUsers = UsersAssembler.toEntitiesFromResponse(response);
            const found = allUsers.find(user => user.email === email && user.password === password);
            if (found) {
                currentUser.value = found;
                // Guardar en localStorage
                localStorage.setItem('currentUser', JSON.stringify(found));
                console.log("Usuario logueado y guardado:", found);
                return true;
            } else {
                throw new Error("Credenciales inválidas");
            }
        } catch (err) {
            console.error("Error en login:", err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const register = async (userData) => {
        loading.value = true;
        try {
            console.log("Registrando usuario:", userData);

            // Aseguramos que type_user sea string y subscriptions_id sea null por defecto
            if (!userData.type_user) {
                userData.type_user = 'client';
            }

            // Crear objeto User para enviar al API
            const user = new User(userData);
            console.log("Usuario a crear:", user);

            // Llamar al API para crear el usuario
            const response = await usersApi.createUsers(user);
            console.log("Respuesta del servidor:", response);

            // Si hay respuesta correcta, guardar el usuario actual
            if (response && response.data) {
                const createdUser = UsersAssembler.toEntityFromResource(response.data);
                currentUser.value = createdUser;
                // Guardar en localStorage después del registro
                localStorage.setItem('currentUser', JSON.stringify(createdUser));
                console.log("Usuario registrado y guardado:", createdUser);
                return true;
            } else {
                throw new Error("No se recibió respuesta del servidor");
            }
        } catch (err) {
            console.error("Error al registrar usuario:", err);
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Logout
    const logout = () => {
        console.log("Cerrando sesión...");
        currentUser.value = null;
        // Eliminar datos de localStorage
        localStorage.removeItem('currentUser');
    };

    const isLoggedIn = computed(() => !!currentUser.value);

    return {
        users, errors, loading, currentUser, isLoggedIn,
        fetchUsers, login, register, logout, initializeUser
    };
});

export default useUsersStore;
