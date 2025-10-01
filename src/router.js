import { createRouter, createWebHistory } from 'vue-router';
import i18n from './i18n';
import MainLayout from './shared/presentation/layouts/main-layout.component.vue';

// Importar componentes para las vistas
const Login = () => import('./hostelmanager/profile/presentation/LoginView.vue');
const Register = () => import('./hostelmanager/profile/presentation/RegisterView.vue');
const Dashboard = () => import('./hostelmanager/profile/presentation/DashboardView.vue');
const HotelsList = () => import('./hostelmanager/hotels/presentation/HotelsListView.vue');
const HotelDetail = () => import('./hostelmanager/hotels/presentation/HotelDetailView.vue');
const HotelCreate = () => import('./hostelmanager/hotels/presentation/HotelCreateView.vue');
const HotelEdit = () => import('./hostelmanager/hotels/presentation/HotelEditView.vue');
const RoomsList = () => import('./hostelmanager/room/presentation/RoomsListView.vue');
const RoomDetail = () => import('./hostelmanager/room/presentation/RoomDetailView.vue');
const RoomCreate = () => import('./hostelmanager/room/presentation/RoomCreateView.vue');
const RoomEdit = () => import('./hostelmanager/room/presentation/RoomEditView.vue');
const ReservationsList = () => import('./hostelmanager/reservation/presentation/ReservationsListView.vue');
const ReservationCreate = () => import('./hostelmanager/reservation/presentation/ReservationCreateView.vue');
const SubscriptionsList = () => import('./hostelmanager/suscription/presentation/SubscriptionsListView.vue');
const ProfileView = () => import('./hostelmanager/profile/presentation/ProfileView.vue');
const NotFound = () => import('./shared/presentation/NotFoundView.vue');

// Configuración de rutas
const routes = [
  // Rutas públicas (sin layout)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: () => i18n.global.t('routes.login')
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresAuth: false,
      title: () => i18n.global.t('routes.register')
    }
  },
  // Rutas con layout principal
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.dashboard')
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.profile')
        }
      },
      // Rutas para hoteles
      {
        path: 'hotels',
        name: 'HotelsList',
        component: HotelsList,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.hotelsList')
        }
      },
      {
        path: 'hotels/create',
        name: 'HotelCreate',
        component: HotelCreate,
        meta: {
          requiresAuth: true,
          requiresOwner: true,
          requiresSubscription: true,
          title: () => i18n.global.t('routes.hotelCreate')
        }
      },
      {
        path: 'hotels/:id',
        name: 'HotelDetail',
        component: HotelDetail,
        props: true,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.hotelDetail')
        }
      },
      {
        path: 'hotels/:id/edit',
        name: 'HotelEdit',
        component: HotelEdit,
        props: true,
        meta: {
          requiresAuth: true,
          requiresOwner: true,
          requiresSubscription: true,
          title: () => i18n.global.t('routes.hotelEdit')
        }
      },
      // Rutas para habitaciones
      {
        path: 'hotels/:hotelId/rooms',
        name: 'RoomsList',
        component: RoomsList,
        props: true,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.roomsList')
        }
      },
      {
        path: 'hotels/:hotelId/rooms/create',
        name: 'RoomCreate',
        component: RoomCreate,
        props: true,
        meta: {
          requiresAuth: true,
          requiresOwner: true,
          requiresSubscription: true,
          title: () => i18n.global.t('routes.roomCreate')
        }
      },
      {
        path: 'rooms/:id',
        name: 'RoomDetail',
        component: RoomDetail,
        props: true,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.roomDetail')
        }
      },
      {
        path: 'rooms/:id/edit',
        name: 'RoomEdit',
        component: RoomEdit,
        props: true,
        meta: {
          requiresAuth: true,
          requiresOwner: true,
          requiresSubscription: true,
          title: () => i18n.global.t('routes.roomEdit')
        }
      },
      // Rutas para reservaciones
      {
        path: 'reservations',
        name: 'ReservationsList',
        component: ReservationsList,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.reservationsList')
        }
      },
      {
        path: 'rooms/:id/reserve',
        name: 'ReservationCreate',
        component: ReservationCreate,
        props: true,
        meta: {
          requiresAuth: true,
          title: () => i18n.global.t('routes.reservationCreate')
        }
      },
      // Ruta para suscripciones
      {
        path: 'subscriptions',
        name: 'SubscriptionsList',
        component: SubscriptionsList,
        meta: {
          requiresAuth: true,
          requiresOwner: true,
          title: () => i18n.global.t('routes.subscriptionsList')
        }
      },
    ]
  },
  // Ruta para página no encontrada
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: () => i18n.global.t('routes.notFound')
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Siempre vuelve al inicio cuando se cambia de página
    return { top: 0 };
  }
});

// Navegación guard para comprobar autenticación y permisos
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresOwner = to.matched.some(record => record.meta.requiresOwner);
  const requiresSubscription = to.matched.some(record => record.meta.requiresSubscription);

  // Obtener usuario del localStorage
  const userJson = localStorage.getItem('currentUser');
  const user = userJson ? JSON.parse(userJson) : null;

  document.title = to.meta.title ? to.meta.title() : 'Hostel Manager';

  if (requiresAuth && !user) {
    // Si requiere autenticación y no hay usuario, redirigir al login
    next({ name: 'Login' });
  } else if (requiresOwner && user && user.user_type !== 'Owner') {
    // Si requiere ser propietario y el usuario no lo es, redirigir al dashboard
    next({ name: 'Dashboard' });
  } else if (requiresSubscription && user && !user.subscription_id) {
    // Si requiere suscripción y el usuario no la tiene, redirigir a la página de suscripciones
    next({ name: 'SubscriptionsList' });
  } else {
    next();
  }
});

export default router;
