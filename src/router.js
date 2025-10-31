import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import PetDetail from './components/PetDetail.vue';
import MyApplications from './components/MyApplications.vue';
import Admin from './components/Admin.vue';
import AdminPetManagement from './components/AdminPetManagement.vue';
import Register from './components/Register.vue';
import UserProfile from './components/UserProfile.vue';
import AdminUserManagement from './components/AdminUserManagement.vue';
import UserAddress from './components/UserAddress.vue';
import ChangePassword from './components/ChangePassword.vue';
import AdminPostManagement from './components/AdminPostManagement.vue';
import PostCreate from './components/PostCreate.vue';

// 【【新增导入】】
import PostList from './components/PostList.vue';
import PostDetail from './components/PostDetail.vue';
import MyPosts from './components/MyPosts.vue'; // 导入新组件

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
    },
    // --- 帖子路由 ---
    {
        path: '/posts',
        name: 'PostList',
        component: PostList,
        meta: { requiresAuth: true }
    },
    {
        path: '/posts/:id',
        name: 'PostDetail',
        component: PostDetail,
        meta: { requiresAuth: true }
    },
    {
        path: '/posts/create',
        name: 'PostCreate',
        component: PostCreate,
        meta: { requiresAuth: true }
    },
    // 【【新增路由：我的帖子】】
    {
        path: '/my-posts',
        name: 'MyPosts',
        component: MyPosts,
        meta: { requiresAuth: true }
    },

    // --- 领养路由 ---
    {
        path: '/pet/:id',
        name: 'PetDetail',
        component: PetDetail,
        meta: { requiresAuth: true }
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

    // --- 管理员 ---
    {
        path: '/admin',
        redirect: '/admin/approvals'
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
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫 (保持不变)
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (loggedIn && userRole === '1') {
        if (to.path === '/login' || to.path === '/register' || to.path === '/') {
            next('/admin/approvals');
            return;
        }
    }
    if (loggedIn && userRole !== '1') {
        if (to.path === '/login' || to.path === '/register') {
            next('/');
            return;
        }
    }
    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        next('/login');
    }
    else if (to.matched.some(record => record.meta.requiresAdmin) && userRole !== '1') {
        alert('您没有权限访问此页面！');
        next('/');
    }
    else {
        next();
    }
});

export default router;