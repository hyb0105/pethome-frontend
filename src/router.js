import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import PetDetail from './components/PetDetail.vue'; // 【新增】导入详情页组件
// 【新增】导入“我的申请”页面组件
import MyApplications from './components/MyApplications.vue';
// 【新增】导入后台管理页面组件
import Admin from './components/Admin.vue';
// 【新增】导入宠物管理页面
import AdminPetManagement from './components/AdminPetManagement.vue';
// 【新增】导入注册页面组件
import Register from './components/Register.vue';
// 【新增】导入个人中心页面组件
import UserProfile from './components/UserProfile.vue';
// 【【新增】】 导入用户管理页面
import AdminUserManagement from './components/AdminUserManagement.vue';
// 【新增】导入地址管理组件
import UserAddress from './components/UserAddress.vue';

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
        path: '/', // 将根路径'/'设置为主页
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true } // 添加一个元字段，表示这个页面需要登录
    },
    {
        path: '/pet/:id', // :id 是一个动态参数，它会匹配/pet/1, /pet/2 等
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
    {
        path: '/admin',
        redirect: '/admin/approvals'
    },
    {
        path: '/admin/approvals',
        name: 'AdminApprovals',
        component: Admin, // Admin.vue 是审批页面
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 【新增】为宠物管理页面添加新路由
    {
        path: '/admin/pets',
        name: 'AdminPetManagement',
        component: AdminPetManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 【【新增】】 为用户管理页面添加新路由
    {
        path: '/admin/users',
        name: 'AdminUserManagement',
        component: AdminUserManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 【新增】为个人中心页面添加路由
    {
        path: '/profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: { requiresAuth: true }
    },
    // 【新增】地址管理路由
    {
        path: '/addresses',
        name: 'UserAddresses',
        component: UserAddress,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 【修改】升级全局路由守卫
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    // 1. 【新增逻辑】如果管理员已登录
    if (loggedIn && userRole === '1') {
        // 访问的是登录页、注册页或主页，全部自动跳转到管理员审批页
        if (to.path === '/login' || to.path === '/register' || to.path === '/') {
            next('/admin/approvals');
            return;
        }
    }

    // 2. 【新增逻辑】如果普通用户已登录
    if (loggedIn && userRole !== '1') {
        // 访问的是登录页或注册页，自动跳转到主页
        if (to.path === '/login' || to.path === '/register') {
            next('/');
            return;
        }
    }

    // 3. (原逻辑) 检查页面是否需要登录
    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        next('/login');
    }
    // 4. (原逻辑) 检查页面是否需要管理员权限
    else if (to.matched.some(record => record.meta.requiresAdmin) && userRole !== '1') {
        alert('您没有权限访问此页面！');
        next('/');
    }
    // 5. (原逻辑) 如果都通过，则正常跳转
    else {
        next();
    }
});

export default router;