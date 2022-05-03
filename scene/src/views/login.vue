<template>
  <div class="login_page fillcontain">
    <transition name="form-fade" mode="in-out">
      <section class="form_contianer" v-show="showLogin">
        <div class="manage_tip">
          <p>景区管理员系统</p>
        </div>
        <el-form :model="loginForm" :rules="rules" ref="loginForm">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名"><span>dsfsf</span></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="密码" v-model="loginForm.password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('loginForm')" class="submit_btn">登录</el-button>
          </el-form-item>
        </el-form>
        <p class="tip">温馨提示：</p>
        <p class="tip">未登录过的新用户，自动注册</p>
        <p class="tip">注册过的用户可凭账号密码登录</p>
      </section>
    </transition>
  </div>
</template>

<script>
	import {login, getAdminInfo} from '@/api/api'
	import {mapActions, mapState} from 'vuex'

  export default {
    name: 'login',
    data(){
      return {
        loginForm: {
          username: '',
          password: '',
        },
        rules: {
          username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ],
        },
        showLogin: false,
      }
    },
    mounted(){
      this.showLogin = true;
      console.log("&&&&&&&&&&&&&&&&")
      console.log("adminInfo", this.adminInfo);
      if (!this.adminInfo._id) {
        console.log("获取用户data")
        this.getAdminData(); 
      }
    },
    computed: {
      // computed 初始化的时候 以及数据发生改变时 执行
      ...mapState(['adminInfo']), // ==> this.adminInfo = store.state.adminInfo
    },
    methods: {
      ...mapActions(['getAdminData']), // --> this.getAdminData = store.action.getAdminData  注意啊 这是function
      async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
      if (valid) {
        const res = await login({username: this.loginForm.username, password: this.loginForm.password})
        if (res.status == 1) {
          this.$message({
            type: 'success',
            message: res.success
          });
          this.$router.push('manage')
        }else{
          this.$message({
            type: 'error',
            message: res.message
          });
        }
      } else {
        this.$notify.error({
        title: '错误',
        message: '请输入正确的用户名密码',
        offset: 100
        });
        return false;
      }
      });
      },
    },
    watch: {
      // 监听的对象：adminInfo  对应的回调 function
      adminInfo: function (newValue){
        // newValue: 是变化后的adminInfo 
        if (newValue._id) {
          this.$message({
            type: 'success',
            message: '检测到您之前登录过，将自动登录'
          });
          this.$router.push('monitor')
          }
        }
    }
  }
</script>

<style lang="less" scoped>
	@import '@/assets/css/mixin';
	.login_page{
		// background-color: #324057;
    background-image: linear-gradient(to right, #30cfd0, #330867);
	}
	.manage_tip{
		position: absolute;
		width: 100%;
		top: -100px;
		left: 0;
		p{
			font-size: 34px;
			color: #fff;
		}
	}
	.form_contianer{
		.wh(320px, 210px);
		.ctp(320px, 210px);
		padding: 25px;
		border-radius: 5px;
		text-align: center;
		background-color: #fff;
		.submit_btn{
			width: 100%;
			font-size: 16px;
		}
	}
	.tip{
		font-size: 12px;
		color: red;
	}
	.form-fade-enter-active, .form-fade-leave-active {
	transition: all 1s;
	}
	.form-fade-enter, .form-fade-leave-active {
	transform: translate3d(0, -50px, 0);
	opacity: 0;
	}
</style>
