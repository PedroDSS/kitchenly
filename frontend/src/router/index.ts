import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy-loaded route components
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const EmailConfirmation = () => import('@/views/auth/EmailConfirmation.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')
const ResetPassword = () => import('@/views/auth/ResetPassword.vue')
const Profile = () => import('@/views/user/Profile.vue')
const Products = () => import('@/views/products/ProductList.vue')
const ProductDetail = () => import('@/views/products/ProductDetail.vue')
const Cart = () => import('@/views/cart/Cart.vue')
const Checkout = () => import('@/views/checkout/Checkout.vue')
const OrderConfirmation = () => import('@/views/orders/OrderConfirmation.vue')
const Orders = () => import('@/views/orders/OrderList.vue')
const OrderDetail = () => import('@/views/orders/OrderDetail.vue')
const EmailAlerts = () => import('@/views/user/EmailAlerts.vue')
const AdminDashboard = () => import('@/views/admin/Dashboard.vue')
const AdminProducts = () => import('@/views/admin/Products.vue')
const AdminOrders = () => import('@/views/admin/Orders.vue')
const AdminUsers = () => import('@/views/admin/Users.vue')
const AdminStock = () => import('@/views/admin/Stock.vue')
const AdminPromoCodes = () => import('@/views/admin/PromoCodes.vue')
const AdminRelayPoints = () => import('@/views/admin/RelayPoints.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/confirm-email/:token',
    name: 'EmailConfirmation',
    component: EmailConfirmation,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { requiresAuth: true }
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'OrderConfirmation',
    component: OrderConfirmation,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/alerts',
    name: 'EmailAlerts',
    component: EmailAlerts,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: AdminProducts,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stock',
    name: 'AdminStock',
    component: AdminStock,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/promo-codes',
    name: 'AdminPromoCodes',
    component: AdminPromoCodes,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/relay-points',
    name: 'AdminRelayPoints',
    component: AdminRelayPoints,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Route guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  // Check if route requires admin privileges
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router