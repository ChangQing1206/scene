<template>
  <div id="app" class="fillcontain">
		<router-view></router-view>
  </div>
</template>

<script>
import login from '@/views/login'
    export default {
      components: {
        login
      }
    }
</script>

<style lang="less">
	@import '@/assets/css/common';
</style>
