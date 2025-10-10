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
                return true;
            } else {
                throw new Error("Credenciales inválidas");
            }
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const register = async (userData) => {
        loading.value = true;
        try {
            console.log("Registrando usuario:", userData); // Debug

            // Aseguramos que type_user sea string y subscriptions_id sea null por defecto
            if (!userData.type_user) {
                userData.type_user = 'client';
            }

            // Crear objeto User para enviar al API
            const user = new User(userData);
            console.log("Usuario a crear:", user); // Debug

            // Llamar al API para crear el usuario
            const response = await usersApi.createUsers(user);
            console.log("Respuesta del servidor:", response); // Debug

            // Si hay respuesta correcta, guardar el usuario actual
            if (response && response.data) {
                currentUser.value = UsersAssembler.toEntityFromResource(response.data);
                return true;
            } else {
                throw new Error("No se recibió respuesta del servidor");
            }
        } catch (err) {
            console.error("Error al registrar usuario:", err); // Debug
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Logout
    const logout = () => {
        currentUser.value = null;
    };

    const isLoggedIn = computed(() => !!currentUser.value);

    return {
        users, errors, loading, currentUser, isLoggedIn,
        fetchUsers, login, register, logout
    };
});

export default useUsersStore;
