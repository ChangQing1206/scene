<template>
  <div class="fillcontain">
    <!-- 售票系统 -->
    
    <head-top></head-top>
    <div class="ticket-area lr_in">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="游客姓名" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="游客手机号" prop="identity">
          <el-input v-model="ruleForm.identity"></el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input v-model="ruleForm.bodyTem"></el-input>
        </el-form-item>
        <el-form-item label="门票状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="选择门票状态">
            <el-option label="未使用" value="unuse"></el-option>
            <el-option label="使用中" value="using"></el-option>
            <el-option label="已报废" value="expired"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">立即出票</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
  </div>
</template>

<script>
import * as mqtt from "mqtt";
import { createTicket, checkTicket } from '@/api/api';
import headTop from '@/components/headTop'
// import { formateDate } from '@utils/formatDate'
export default {
  mounted() {
    // 初始化mqtt客户端
    console.log("售票系统开始")
    this.initMqtt();
  },
  data() {
    var validateId = (rule, value, callback) => {
      // 生成身份证正则表达式
//      var regx = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      var regx = /^1[1-9]{10}$/
      if(regx.test(value)) callback();
      else callback(new Error("手机号格式错误!"));
    }
    return {
      client: '', // 售票客户端
      vistorId: '',
      ready: 0,
      ruleForm: {
        name: '',
        identity: '',
        status: '',
        amount: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入游客姓名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 自定义规则验证身份证 
        identity: [
          { required: true, message: '请输入手机号', trigger: 'blur'},
          { validator: validateId, trigger: 'blur'}
        ],
      }
    }
  },
  components: {
    headTop
  },
  methods: {
    initMqtt() {
      // 1.连接mqtt服务器
      this.client = mqtt.connect("ws://localhost:3012");
      
      // 2.订阅获取clientId的主题 获取clientId通信  用于游客设备通信
      this.client.subscribe("ticket/get_clientId");  // 用于游客设备通信
      this.client.subscribe("ticket/ready");         // 出票提醒
      this.client.subscribe("ticket/check");         // 用于门票验证  上传至服务器
      this.client.subscribe("ticket/response");      // 出票成功响应
      this.client.on('message', (topic, payload) => {
        console.log(topic)
        switch(topic) {
          case "ticket/ready": 
            if(JSON.parse(payload.toString()).state == 2)
              this.ready = 1;   // 已准备
            break;
          case "ticket/get_clientId":
            this.vistorId = payload.toString();  // 取到游客设备id
            alert("设备" + this.vistorId + "启动")
            break;
          case "ticket/response":
            if(JSON.parse(payload.toString()).state === 1)
            {
              var content = {
                client_id: this.vistorId, 
                name: this.ruleForm.name, 
                identity: this.ruleForm.identity, 
                // create_time:  formateDate(),  后端生成时间
                status: this.ruleForm.status,
                deposit: this.ruleForm.amount
              }
              this.createTicket(content);

            }else {
              this.$message({
                type: "error",
                message: "硬件出票错误"
              })
            }
            break;
          case "ticket/check":
            var check = JSON.parse(payload.toString())
            if(check.state == 1) {
              this.checkTicket({name: check.name, identity: check.identity, status: check.status});
            }else {
              this.$message({
                type: "error",
                message: "硬件验票失败"
              })
            }
            break;
          default:
            console.log("topic错误");
            break;
        }
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if(! this.ready) {
            this.$message({
              type: 'error',
              message: '出票设备未准备好'
            })
            return;
          }
          // 发送游客信息给游客设备  便于后面上传
          this.client.publish("vistor/get_Message/" + this.vistorId, JSON.stringify({name: this.ruleForm.name, identity: this.ruleForm.identity}), function() {

          })
          // 出票信息下发
          var content = {
            name: this.ruleForm.name, 
            identity: this.ruleForm.identity, 
            status: this.ruleForm.status,
            deposit: this.ruleForm.amount
          }
          this.client.publish("vistor/create_ticket", JSON.stringify(content), function(err) {console.log(err)})
        } else {
          this.$message({
            type: 'error',
            message: '输入错误'
          })
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    createTicket(ticket) {
      createTicket(ticket).then(res => {
        if(res.status == "1") {
          this.$message({
            type: 'success',
            message: '门票创建成功'
          })
        }else {
          this.$message({
            type: 'error',
            message: '软件出票失败'
          })
        }
      }).catch( err => {
          this.$message({
            type: 'error',
            message: err
          })
      })
    },
    checkTicket(check) {
      checkTicket(check).then(res => {
        if(res.status) {
          this.$message({
            type: "success",
            message: '验票成功'
          })
        }else {
          this.$message({
            type: "error",
            message: '软件验票失败'
          })
        }
      })
    }
  }

}
</script>

<style lang="less">

  @import '@/assets/css/common';
  @import '@/assets/css/mixin';
  .ticket-area {
    width: 60vw;
    margin-top: 100px;
  }
</style>