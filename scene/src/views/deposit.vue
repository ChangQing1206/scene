<template>
  <div class="fillcontain">
        <!--  充值系统  -->
    <head-top></head-top>
    <div class="deposit_area">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="游客姓名" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="游客身份证" prop="identity">
          <el-input v-model="ruleForm.identity"></el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="deposit">
          <el-input v-model="ruleForm.deposit"></el-input>
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
    var validateId = (rule, value, callback) => {
      // 生成身份证正则表达式
      var regx = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      if(regx.test(value)) callback();
      else callback(new Error("身份证格式错误!"));
    }
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
        deposit: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入游客姓名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 自定义规则验证身份证 
        identity: [
          { required: true, message: '请输入身份证', trigger: 'blur'},
          { validator: validateId, trigger: 'blur'}
        ],
        bodyTem: [
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
      this.client = mqtt.connect("ws://localhost:3010");
      console.log("连接mqtt成功");
    },
    getClientId(name, identity) {
      getClientId({name: name, identity: identity}).then(res => {
        if(res.status) {
          this.clientId = res.clientId;
        }
        else {
          this.$message({
            type: 'error',
            message: '获取游客id失败'
          })
        }
      }).catch(err => err)
    },
    increaseDeposit(d) {
      increaseDeposit(d).then(res => {
        if(res.status) {
          this.$message({
            type: 'success',
            message: '充值成功'
          })
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 验证成功 发送至 特定client
          // 获取clientId
          this.getClientId(this.ruleForm.name, this.ruleForm.identity);
          var topic = "vistor/increase_deposit/" + this.clientId;
          var content = {
            name: this.ruleForm.name,
            identity: this.ruleForm.identity,
            deposit: this.ruleForm.deposit
          }
          console.log(topic);
          this.client.publish(topic, JSON.stringify(content), (err) => {
            if(err) {
              this.$message({
                type: 'success',
                message: '充值失败'
              })
            }
            else {
              // 写入数据库
              this.increaseDeposit(content);
            }
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