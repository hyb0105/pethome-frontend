import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Home from './components/Home.vue';

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('authToken');

    // 如果目标页面需要登录，但用户未登录，则强制跳转到登录页
    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        next('/login');
    } else {
        next(); // 否则，正常跳转
    }
});

export default router;