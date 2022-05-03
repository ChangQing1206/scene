<template>
  <div class="fillcontain">
        <!--  充值系统  -->
    <head-top></head-top>
    <div class="deposit_area">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="游客姓名" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="游客手机号" prop="identity">
          <el-input v-model="ruleForm.identity"></el-input>
        </el-form-item>
        <el-form-item label="当前余额" prop="amount">
          <el-input v-model="ruleForm.amount"></el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="deposit">
          <el-input v-model="ruleForm.deposit"></el-input>
        </el-form-item>
        <el-form-item label="充值状态" prop="response">
          <el-input v-model="ruleForm.response"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">充值</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
  </div>
</template>

<script>
import headTop from '@/components/headTop'
import { getClientId, increaseDeposit } from '@/api/api'
import * as mqtt from 'mqtt'
export default {
  data() {
    // var validateId = (rule, value, callback) => {
    //   // 生成身份证正则表达式
    //   var regx = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    //   if(regx.test(value)) callback();
    //   else callback(new Error("身份证格式错误!"));
    // }
    var validateNumber = (rule, value, callback) => {
      if( typeof Number(value) == 'number') callback();
      else callback(new Error("充值金额必须为数字"));
    }
    return {
      clientId: '',
      client: '',
      ruleForm: {
        name: '',
        identity: '',
        deposit: '',
        amount: '',
        response: ''
      },
      status: '',
      rules: {
        // name: [
        //   { required: true, message: '请输入游客姓名', trigger: 'blur' },
        //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        // ],
        // // 自定义规则验证身份证 
        // identity: [
        //   { required: true, message: '请输入身份证', trigger: 'blur'},
        //   { validator: validateId, trigger: 'blur'}
        // ],
        deposit: [
          { required: true, message: '请输入充值金额', trigger: 'blur'},
          { validator: validateNumber, message: '充值金额必须为数字'}
        ]
      }
    }
  },
  mounted() {
    this.initMqtt();
  },
  methods: {
    initMqtt() {
      // 1.连接mqtt服务器
      this.client = mqtt.connect("ws://localhost:3012");
      // console.log("连接mqtt成功");
      this.subscribe("deposit/ready"); // 订阅准备提醒
      this.client.on('message', (topic, payload) => {
      //  console.log(topic);
        switch(topic) {
          case "deposit/ready":
            var vdata = JSON.parse(payload.toString);
            this.ruleForm.name = vdata.name;
            this.ruleForm.identity = vdata.identity;
            this.ruleForm.amount = vdata.amount;
            alert("充值设备已准备");
            break;
          case "deposit/response":
            this.status = 1;
            break;
        }
      })
    },

    // getClientId(name, identity) {
    //   getClientId({name: name, identity: identity}).then(res => {
    //     if(res.status) {
    //       this.clientId = res.clientId;
    //       if(!this.clientId) {
    //         this.$message({
    //           type: 'error',
    //           message: '该游客不存在或已离开景区'
    //         })
    //         return;
    //       }
    //       var topic = "vistor/increase_deposit/" + this.clientId;
    //       var content = {
    //         name: this.ruleForm.name,
    //         identity: this.ruleForm.identity,
    //         deposit: this.ruleForm.deposit
    //       }
    //       // 订阅充值响应主题  vistor/increase_deposit_response
    //       this.increase_deposit_response = "vistor/increase_deposit_response/" + this.clientId;
    //       this.client.subscribe(this.increase_deposit_response);
    //       // 发送充值数据
    //       this.client.publish(topic, JSON.stringify(content), (err) => {
    //         // 服务器只要开着，就必然接收成功 所以这样不行
    //         if(err) {
    //           this.$message({
    //             type: 'error',
    //             message: '充值错误'
    //           })
    //           content.status = "充值错误";
    //           this.increaseDeposit(content);
    //           return;
    //         }
    //         // 发送后检查充值响应状态
    //         setTimeout(() => {
    //           // 1秒后检查充值状态是否改变
    //           if(this.status) {
    //             console.log("------------------------");
    //             console.log(this.status);
    //             content.status = "充值成功";
    //             this.increaseDeposit(content);
    //             this.status = '';
    //             this.$message({
    //               type: 'success',
    //               message: '充值成功'
    //             })
    //           }else {
    //             content.status = "充值失败";
    //             this.increaseDeposit(content);
    //             this.$message({
    //               type: 'error',
    //               message: '充值失败'
    //             })
    //           }
    //         }, 1000)
    //       })
    //     }
    //     else {
    //       this.$message({
    //         type: 'error',
    //         message: '获取游客id失败'
    //       })
    //     }
    //   }).catch(err => err)
    // },
    increaseDeposit(d) {
      increaseDeposit(d).then(res => {
  //      console.log(res);
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 验证成功 发送至 特定client
          // 获取clientId  游客id在创建门票时已经存储在门票表
          //this.getClientId(this.ruleForm.name, this.ruleForm.identity);
          if(! this.ready) {
            this.$message({
              type: 'error',
              message: '充值设备未准备好'
            })
            return;
          }

          // 发送充值金额给硬件
          this.client.publish("vistor/increase_deposit", JSON.stringify({amount: this.deposit}), function() {
            var content = {
              name: this.ruleForm.name,
              identity: this.ruleForm.identity,
              deposit: this.ruleForm.deposit,
            }
            setTimeout(() => {
              // 检查status
              if(this.status) {
                this.response = "充值成功";
                this.status = 0;
                // 填数据库
                content.status = this.response;
                this.increaseDeposit(content);
              }
              else {
                this.$message({
                  type: 'error',
                  message: '出票失败'
                })
                content.status = "充值失败";
                this.increaseDeposit(content);
              }
            }, 2000)
          })          
        } else {
          this.$message({
            type: 'error',
            message: '充值错误'
          })
          return false;
        }
      });
    }
  },
  components: {
    headTop
  }
}
</script>

<style lang="less" scoped>
  @import '@/assets/css/mixin';
  .deposit_area {
    width: 40%;
    height: 50%;
    margin: 0 auto;
    margin-top: 300px;
  }
</style>