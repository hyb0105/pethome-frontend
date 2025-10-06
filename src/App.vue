<template>
  <div id="app">
    <Login />
  </div>
</template>

<script>
import Login from './components/Login.vue';

export default {
  name: 'App',
  components: {
    Login
  }
};
</script>

<style>
/* 你可以保留或清空这里的全局样式 */
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>