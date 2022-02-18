<template>
	<div class="manage_page fillcontain">
		<el-row style="height: 100%;">
      <el-col :span="4" style="min-height: 100%; background-color: #324057;">
				<el-menu :default-active="defaultActive" style="max-width:100%;" background-color="#324057" text-color="#ffffff" router>
					<el-menu-item index="manage"><i class="el-icon-menu"></i>首页</el-menu-item>
					<el-menu-item index="monitor"><i class="el-icon-monitor"></i>监控平台</el-menu-item>
          <el-submenu index="2" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-document"></i>数据管理</template>
						<el-menu-item index="dataCheck">游客数据查询</el-menu-item>
						<el-menu-item index="consumeCheck">游客消费查询</el-menu-item>
						<el-menu-item index="posAnalysis">游客位置分析</el-menu-item>
            <el-menu-item index="consumeAnalysis">游客消费分析</el-menu-item>
					</el-submenu>
					<el-submenu index="3" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-plus"></i>门票管理</template>
						<el-menu-item index="sellTicket">售票</el-menu-item>
						<el-menu-item index="ticketStatistics">门票统计</el-menu-item>
					</el-submenu>
					<el-submenu index="4" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-star-on"></i>图表</template>
						<el-menu-item index="visitor">用户分布</el-menu-item>
					</el-submenu>
					<el-submenu index="5" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-edit"></i>编辑</template>
						<el-menu-item index="vueEdit">文本编辑</el-menu-item>
					</el-submenu>
					<el-submenu index="6" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-setting"></i>设置</template>
						<el-menu-item index="adminSet">管理员设置</el-menu-item>
					</el-submenu>
					<el-submenu index="7" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-warning"></i>说明</template>
						<el-menu-item index="explain">说明</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-col>
			<el-col :span="20" style="height: 100%;overflow: auto;">
				<keep-alive>
          <router-view></router-view>
				</keep-alive>
			</el-col>
		</el-row>
  </div>
</template>

<script>
  export default {
    computed: {
      defaultActive: function(){
        return this.$route.path.replace('/', '');
      }
    },
  }
</script>


<style lang="less" scoped>
	@import '@/assets/css/mixin';
	.manage_page{
		
	}

</style>
