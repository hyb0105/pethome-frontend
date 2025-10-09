import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import PetDetail from './components/PetDetail.vue'; // 【新增】导入详情页组件

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