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
        <el-form-item label="门票状态" prop="status">
          <el-input v-model="ruleForm.status"></el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="deposit">
          <el-input v-model="ruleForm.deposit"></el-input>
        </el-form-item>
        <el-form-item label="充值状态" prop="deposit_state">
          <el-input v-model="ruleForm.deposit_state"></el-input>
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
    var validateNumber = (rule, value, callback) => {
      if( typeof Number(value) == 'number') callback();
      else callback(new Error("充值金额必须为数字"));
    }
    return {
      clientId: '',
      client: '',
      ready: 0,
      ruleForm: {
        name: '',
        identity: '',
        deposit: '',
        amount: '',
        status: '',
        deposit_state: ''
      },
      rules: {
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
      this.client.subscribe("deposit/ready"); // 订阅准备提醒
      this.client.on('message', (topic, payload) => {
        switch(topic) {
          case "deposit/ready":
            var vdata = JSON.parse(payload.toString());
            if(vdata.state === 2)  {
              this.ruleForm.name = vdata.name;
              this.ruleForm.identity = vdata.identity;
              this.ruleForm.status  = vdata.status;
              this.ruleForm.amount = vdata.amount;
              this.$message({
                type: "success",
                message: "充值设备已准备"
              })
              this.ready = 1;
            }

            break;
          case "deposit/response":
            var content = {
              name: this.ruleForm.name,
              identity: this.ruleForm.identity,
              deposit: this.ruleForm.deposit
            }
            if(JSON.parse(payload.toString().state === 1)) {
              this.deposit_state = "充值成功";
              content.status = this.deposit_state;
              increaseDeposit(content);
            }else {
              this.deposit_state = "充值失败"
              content.status = this.deposit_state;
              increaseDeposit(content);
              this.$message({
                type: 'error',
                message: "硬件充值失败"
              })
            }
            break;
        }
      })
    },
    increaseDeposit(d) {
      increaseDeposit(d).then(res => {
        if(res.status) {
          this.$message({
            type: 'success',
            message: "充值成功"
          })
        }else {
          this.$message({
            type: 'success',
            message: "软件充值错误"
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
          if(! this.ready) {
            this.$message({
              type: 'error',
              message: '充值设备未准备好'
            })
            return;
          }
          // 发送充值金额给硬件
          this.client.publish("vistor/increase_deposit", JSON.stringify({amount: this.ruleForm.deposit}), function(err) {console.log(err)})          
        } else {
          this.$message({
            type: 'error',
            message: '输入错误'
          })
        }
      })
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