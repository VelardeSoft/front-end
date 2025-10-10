import {createRouter, createWebHistory} from "vue-router";

import Login from "./hostelmanagers/users/presentation/views/login.vue";
import Register from "./hostelmanagers/users/presentation/views/register.vue";
import Profile from "./hostelmanagers/users/presentation/views/profile.vue";

const routes = [
    {
        path: "/", name: "name", component: Login, meta: {title: "Home", public: true}
    },
    {
        path: "/login", name: "login", component: Login, meta: {title: "Login", public: true}
    },
    {
        path: "/register", name: "register", component: Register, meta: {title: "Register", public: true}
    },
    {
        path: "/profile", name: "profile", component: Profile, meta: {title: "Perfil"}
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,

});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    let baseTitle = 'Development';
    document.title = `${baseTitle} - ${to.meta['title']}`;
    // TODO: Call authentication guard
    next();
});

export default router;