import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import PetDetail from './components/PetDetail.vue'; // 【新增】导入详情页组件
// 【新增】导入“我的申请”页面组件
import MyApplications from './components/MyApplications.vue';
// 【新增】导入后台管理页面组件
import Admin from './components/Admin.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
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
        name: 'Admin',
        component: Admin,
        meta: { requiresAuth: true, requiresAdmin: true } // 表示需要登录且需要管理员权限
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 【修改】升级全局路由守卫
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole'); // 获取用户角色

    // 1. 检查页面是否需要登录
    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        // 如果需要登录但用户未登录，跳转到登录页
        next('/login');
    }
    // 2. 检查页面是否需要管理员权限
    else if (to.matched.some(record => record.meta.requiresAdmin) && userRole !== '1') {
        // 如果需要管理员权限但用户不是管理员，可以跳转到主页或一个“无权限”页面
        alert('您没有权限访问此页面！');
        next('/'); // 跳转回主页
    }
    // 3. 如果都通过，则正常跳转
    else {
        next();
    }
});

export default router;