<template>
  <div class="login_page fillcontain">
    <transition name="form-fade" mode="in-out">
      <section class="form_contianer">
        <div class="manage_tip">
          <p>景区管理员系统</p>
        </div>
        <el-form :model="loginForm" :rules="rules" ref="loginForm" v-show="status">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="密码" v-model="loginForm.password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('loginForm')" class="submit_btn">登录</el-button>
          </el-form-item>
        </el-form>

        <el-form :model="RegisterForm" :rules="rules" ref="RegisterForm" v-show="!status">
          <el-form-item prop="username">
            <el-input v-model="RegisterForm.username" placeholder="用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="密码" v-model="RegisterForm.password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-select @change="chooseRole" v-model="RegisterForm.role" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('RegisterForm')" class="submit_btn">注册</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-right" circle @click="changeStatus"></el-button>
        <!-- <p class="tip">温馨提示：</p>
        <p class="tip">未登录过的新用户，自动注册</p>
        <p class="tip">注册过的用户可凭账号密码登录</p> -->
      </section>
    </transition>
  </div>
</template>

<script>
	import {login, getAdminInfo, register} from '@/api/api'
	import {mapActions, mapState} from 'vuex'

  export default {
    name: 'login',
    data(){
      return {
        loginForm: {
          username: '',
          password: ''
        },
        RegisterForm: {
          username: '',
          password: '',
          role: '',
          token: ''
        },
        options: [{label: "游客", value: 1}, {label: "商家", value: 2}, {label: "管理员", value: 3}],
        rules: {
          username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ],
        },
        status: true
      }
    },
    mounted(){
      console.log("adminInfo", this.adminInfo);
      // if (!this.adminInfo.user) {
        this.getAdminData(); 
      // }
    },
    computed: {
      // computed 初始化的时候 以及数据发生改变时 执行
      ...mapState(['adminInfo']), // ==> this.adminInfo = store.state.adminInfo
    },
    methods: {
      ...mapActions(['getAdminData']), // --> this.getAdminData = store.action.getAdminData  注意啊 这是function
      submitForm(formName) {
        if(formName === 'loginForm'){
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const res = await login({username: this.loginForm.username, password: this.loginForm.password})
            if (res.status == 1) {
              this.$message({
                type: 'success',
                message: res.success
              });
              // res.message 处理权限 和 角色 token
              localStorage.setItem('user_token', res.message.token);
              localStorage.setItem('role', res.message.role);
              localStorage.setItem('power', res.message.power);
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
        })
      }else if (formName === 'RegisterForm'){
        this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const res = await register({username: this.RegisterForm.username, password: this.RegisterForm.password, role: this.RegisterForm.role, token: this.RegisterForm.token})
          if (res.status == 1) {
            this.$message({
              type: 'success',
              message: res.success
            });
            // this.$router.push('login')
            this.changeStatus();
          }else{
            this.$message({
              type: 'error',
              message: res.message
            });
          }
        } else {
          this.$notify.error({
          title: '错误',
          message: '注册失败',
          offset: 100
          });
          return false;
        }
      })
      this.RegisterForm.role = "";
      }
      },
      
      changeStatus() {
        this.status = !this.status
      },
      chooseRole() {

        if(this.RegisterForm.role === 2) {
          this.$prompt('请输入商家注册码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          }).then(({ value }) => {
            this.$message({
              type: 'success',
              message: '你的商家注册码是: ' + value
            });
            this.RegisterForm.token = value;
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消输入'
            });       
          });
        }
        if(this.RegisterForm.role === 3) {
          this.$prompt('请输入管理员注册码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          }).then(({ value }) => {
            this.$message({
              type: 'success',
              message: '你的管理员注册码是: ' + value
            });
            this.RegisterForm.token = value;
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消输入'
            });       
          });
        }
        
      }
    },
    
    watch: {
      // 监听的对象：adminInfo  对应的回调 function  // 自动的登陆
      // adminInfo: function (newValue){
      //   // newValue: 是变化后的adminInfo 
      //   if (newValue.user) {
      //     this.$message({
      //       type: 'success',
      //       message: '检测到您之前登录过，将自动登录'
      //     });
      //     this.$router.push('manage')
      //     }
      //   }
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
