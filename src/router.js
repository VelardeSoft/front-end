import {createRouter, createWebHistory} from "vue-router";
import MainLayout from "./shared/presentation/components/layout.vue";
import Login from "./hostelmanagers/users/presentation/views/login.vue";
import Register from "./hostelmanagers/users/presentation/views/register.vue";
import Profile from "./hostelmanagers/users/presentation/views/profile.vue";
import HotelList from "./hostelmanagers/hotels/presentation/views/hotel-list.vue";
import HotelForm from "./hostelmanagers/hotels/presentation/views/hotel-form.vue";
import HotelDetails from "./hostelmanagers/hotels/presentation/views/hotel-details.vue";
import RoomList from "./hostelmanagers/rooms/presentation/views/room-list.vue";
import RoomForm from "./hostelmanagers/rooms/presentation/views/room-form.vue";
import ReservationList from "./hostelmanagers/reservations/presentation/views/reservation-list.vue";
import ReservationForm from "./hostelmanagers/reservations/presentation/views/reservation-form.vue";
import ReservationDetail from "./hostelmanagers/reservations/presentation/views/reservation-detail.vue";
import SubscriptionList from "./hostelmanagers/subscriptions/presentation/views/subscription-list.vue";
import SubscriptionForm from "./hostelmanagers/subscriptions/presentation/views/subscription-form.vue";
import PageNotFound from "./shared/presentation/views/page-not-found.vue";

const routes = [
    {
        path: "/",
        component: MainLayout,
        children: [
            {
                path: "",
                name: "home",
                component: Login,
                meta: {title: "Login", public: true}
            },
            {
                path: "login",
                name: "login",
                component: Login,
                meta: {title: "Login", public: true}
            },
            {
                path: "register",
                name: "register",
                component: Register,
                meta: {title: "Register", public: true}
            },
            {
                path: "profile",
                name: "profile",
                component: Profile,
                meta: {title: "Perfil"}
            },
            {
                path: "hotels",
                name: "hotel-list",
                component: HotelList,
                meta: {title: "Hoteles"}
            },
            {
                path: "hotels/new",
                name: "hotel-create",
                component: HotelForm,
                meta: {title: "Nuevo Hotel", requiresOwner: true}
            },
            {
                path: "hotels/:id",
                name: "hotel-details",
                component: HotelDetails,
                meta: {title: "Detalles del Hotel"}
            },
            {
                path: "hotels/:id/edit",
                name: "hotel-edit",
                component: HotelForm,
                meta: {title: "Editar Hotel", requiresOwner: true}
            },
            {
                path: "rooms",
                name: "room-list",
                component: RoomList,
                meta: {title: "Habitaciones"}
            },
            {
                path: "rooms/new",
                name: "room-create",
                component: RoomForm,
                meta: {title: "Nueva Habitación", requiresOwner: true}
            },
            {
                path: "rooms/:id/edit",
                name: "room-edit",
                component: RoomForm,
                meta: {title: "Editar Habitación", requiresOwner: true}
            },
            {
                path: "reservations",
                name: "reservation-list",
                component: ReservationList,
                meta: {title: "Reservaciones"}
            },
            {
                path: "reservations/new",
                name: "reservation-create",
                component: ReservationForm,
                meta: {title: "Nueva Reservación", requiresClient: true}
            },
            {
                path: "reservations/:id",
                name: "reservation-detail",
                component: ReservationDetail,
                meta: {title: "Detalles de Reservación"}
            },
            {
                path: "subscriptions",
                name: "subscription-list",
                component: SubscriptionList,
                meta: {title: "Suscripciones", requiresOwner: true}
            },
            {
                path: "subscriptions/new",
                name: "subscription-create",
                component: SubscriptionForm,
                meta: {title: "Nueva Suscripción", requiresOwner: true}
            },
            {
                path: "subscriptions/:id/edit",
                name: "subscription-edit",
                component: SubscriptionForm,
                meta: {title: "Editar Suscripción", requiresOwner: true}
            }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: PageNotFound,
        meta: {title: "Página no encontrada", public: true}
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    let baseTitle = 'Hostel Manager';
    document.title = `${baseTitle} - ${to.meta.title || ''}`;
    
    // Recuperar el usuario del localStorage
    const userJson = localStorage.getItem('currentUser');
    const isAuthenticated = !!userJson;
    const currentUser = isAuthenticated ? JSON.parse(userJson) : null;
    
    // Verificar si la ruta es pública
    if (to.meta.public) {
        if (isAuthenticated && (to.name === 'login' || to.name === 'register' || to.name === 'home')) {
            next({ name: 'hotel-list' });
            return;
        }
        next();
        return;
    }
    
    // Verificar autenticación para rutas protegidas
    if (!isAuthenticated) {
        next({ name: 'login' });
        return;
    }
    
    // Verificar permisos específicos
    if (to.meta.requiresOwner && currentUser.type_user !== 'owner') {
        next({ name: 'hotel-list' });
        return;
    }
    
    if (to.meta.requiresVisitor && currentUser.type_user !== 'visitor') {
        next({ name: 'reservation-list' });
        return;
    }
    
    // Si pasa todas las verificaciones
    next();
});

export default router;