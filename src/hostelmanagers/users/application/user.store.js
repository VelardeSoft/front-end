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

    // Fetch all users (admin only or para pruebas)
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

    // Login: solo match email + password (sin hash real)
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

    // Register: agrega el usuario y lo loguea
    const register = async (userData) => {
        loading.value = true;
        try {
            const user = new User(userData);
            const response = await usersApi.createUsers(user);
            const created = UsersAssembler.toEntityFromResource(response.data);
            currentUser.value = created;
            return true;
        } catch (err) {
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

    // Perfil
    const isLoggedIn = computed(() => !!currentUser.value);

    return {
        users, errors, loading, currentUser, isLoggedIn,
        fetchUsers, login, register, logout
    };
});

export default useUsersStore;
