<template>
  <router-view />
  <el-button style="position: absolute;left: 50%;transform: translateX(-50%);top: 0;z-index: 99999;opacity: .8" @click="handleRefresh">刷新({{$route.fullPath}})</el-button>
  <div id="notification" class="hidden">
    <p id="message"></p>
    <button id="close-button" @click="closeNotification()">
      Close
    </button>
    <button id="restart-button" @click="restartApp()" class="hidden">
      Restart
    </button>
  </div>
</template>
<script setup>
import {onMounted} from "vue";

const handleRefresh = () => {
  window.location.reload()
}
onMounted(()=> {
  const notification = document.getElementById('notification');
  const message = document.getElementById('message');
  const restartButton = document.getElementById('restart-button');
  ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = '更新进行中...';
    notification.classList.remove('hidden');
  });
  ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = '更新完成，马上重启?';
    restartButton.classList.remove('hidden');
    notification.classList.remove('hidden');
  });
})
function closeNotification() {
  const notification = document.getElementById('notification')
  notification.classList.add('hidden');
}
function restartApp() {
  ipcRenderer.send('restart_app');
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
#notification {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 200px;
  padding: 20px;
  border-radius: 5px;
  background-color: white;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}
.hidden {
  display: none;
}
</style>
