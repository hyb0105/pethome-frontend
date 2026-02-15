import { createRouter, createWebHistory } from 'vue-router';

// --- 基础组件 ---
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import Home from './components/Home.vue';
import Navbar from './components/Navbar.vue';

// --- 用户业务组件 ---
import PetDetail from './components/PetDetail.vue';
import MyApplications from './components/MyApplications.vue';
import UserProfile from './components/UserProfile.vue';
import UserAddress from './components/UserAddress.vue';
import ChangePassword from './components/ChangePassword.vue';

// --- 社区业务组件 ---
import PostList from './components/PostList.vue';
import PostDetail from './components/PostDetail.vue';
import PostCreate from './components/PostCreate.vue';
import MyPosts from './components/MyPosts.vue';
import MyLikedPosts from './components/MyLikedPosts.vue'; // 这里依然指向收藏页组件

// --- 管理员组件 ---
import Admin from './components/Admin.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import AdminPetManagement from './components/AdminPetManagement.vue';
import AdminUserManagement from './components/AdminUserManagement.vue';
import AdminPostManagement from './components/AdminPostManagement.vue';
import AdminCommentManagement from './components/AdminCommentManagement.vue';
import AdminCarouselManagement from './components/AdminCarouselManagement.vue';

const routes = [
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: false }
    },
    // --- 社区/经验分享路由 ---
    {
        path: '/posts',
        name: 'PostList',
        component: PostList,
        meta: { requiresAuth: false }
    },
    {
        path: '/posts/:id',
        name: 'PostDetail',
        component: PostDetail,
        meta: { requiresAuth: false }
    },
    {
        path: '/posts/create',
        name: 'PostCreate',
        component: PostCreate,
        meta: { requiresAuth: true }
    },
    {
        path: '/my-posts',
        name: 'MyPosts',
        component: MyPosts,
        meta: { requiresAuth: true }
    },
    {
        path: '/my-collections',
        name: 'MyCollectedPosts',
        component: MyLikedPosts,
        meta: { requiresAuth: true }
    },

    // --- 领养路由 ---
    {
        path: '/pet/:id',
        name: 'PetDetail',
        component: PetDetail,
        meta: { requiresAuth: false }
    },
    {
        path: '/my-applications',
        name: 'MyApplications',
        component: MyApplications,
        meta: { requiresAuth: true }
    },

    // --- 用户中心 ---
    {
        path: '/profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: { requiresAuth: true }
    },
    {
        path: '/addresses',
        name: 'UserAddresses',
        component: UserAddress,
        meta: { requiresAuth: true }
    },
    {
        path: '/change-password',
        name: 'ChangePassword',
        component: ChangePassword,
        meta: { requiresAuth: true }
    },

    // --- 管理端路由 ---
    {
        path: '/admin',
        redirect: '/admin/dashboard'
    },
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/approvals',
        name: 'AdminApprovals',
        component: Admin,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/pets',
        name: 'AdminPetManagement',
        component: AdminPetManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/users',
        name: 'AdminUserManagement',
        component: AdminUserManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/posts',
        name: 'AdminPostManagement',
        component: AdminPostManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/comments',
        name: 'AdminCommentManagement',
        component: AdminCommentManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/carousels',
        name: 'AdminCarouselManagement',
        component: AdminCarouselManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('authToken');

    // 1. 如果去的是首页、注册页、或者明确标记为不需要认证的页面，直接放行
    if (to.path === '/' || to.path === '/register' || to.meta.requiresAuth === false) {
        next();
        return;
    }

    // 2. 如果去的是登录页
    if (to.path === '/login') {
        if (token) {
            next('/'); // 已登录还想去登录页？送回首页
        } else {
            next();    // 没登录，允许去登录
        }
        return;
    }

    // 3. 需要认证的页面
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            next('/login'); // 没登录，踢去登录页
        } else {
            // 检查管理员权限
            const userRole = localStorage.getItem('userRole');
            if (to.matched.some(record => record.meta.requiresAdmin) && userRole !== '1') {
                alert('权限不足');
                next('/');
            } else {
                next();
            }
        }
    } else {
        next();
    }
});

export default router;