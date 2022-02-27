<template>
  <div class="fillcontain">
    <!-- 售票系统 -->
    
    <head-top></head-top>
    <div class="ticket-area lr_in">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="游客姓名" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="游客身份证" prop="identity">
          <el-input v-model="ruleForm.identity"></el-input>
        </el-form-item>
        <el-form-item label="游客体温" prop="bodyTem">
          <el-input v-model="ruleForm.bodyTem"></el-input>
        </el-form-item>
        <el-form-item label="游客经度" prop="positionLong">
          <el-input v-model="ruleForm.position[0]"></el-input>
        </el-form-item>
        <el-form-item label="游客纬度" prop="positionLati">
          <el-input v-model="ruleForm.position[1]"></el-input>
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
import { createTicket } from '@/api/api';
import headTop from '@/components/headTop'
export default {
  mounted() {
    // 初始化mqtt客户端
    console.log("售票系统开始")
    this.initMqtt();
  },
  data() {
    var validateId = (rule, value, callback) => {
      // 生成身份证正则表达式
      var regx = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      if(regx.test(value)) callback();
      else callback(new Error("身份证格式错误!"));
    }
    var validateNumber = (rule, value, callback) => {
      if( typeof Number(value) == 'number') callback();
      else callback(new Error("体温必须为数字"));
    }
    return {
      client: '', // 售票客户端
      vistorId: '',
      status: '', // 门票创建响应状态
      create_ticket_response: '', 
      ruleForm: {
        name: '',
        identity: '',
        bodyTem: '',
        position: [113.086051,22.600441],
        status: '',
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
          { required: true, message: '请输入游客体温', trigger: 'blur'},
          { validator: validateNumber, message: '体温必须为数字'}
        ]
      }
    }
  },
  components: {
    headTop
  },
  methods: {
    initMqtt() {
      // 1.连接mqtt服务器
      this.client = mqtt.connect("ws://localhost:3010");
      
      // 2.订阅获取clientId的主题 获取clientId通信
      this.client.subscribe("ticket/get_clientId");

      this.client.on('message', (topic, payload) => {
        console.log("==============")
        console.log(topic)
        switch(topic) {
          case "ticket/get_clientId":
            this.vistorId = payload.toString();
            alert("游客设备"+this.vistorId+"可以出票了");
            break;
          case this.create_ticket_response:
            var response = JSON.parse(payload.toString());
            this.status = response.status;
            break;
          default:
            console.log("主题错误");
            break;
        }
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 验证成功 发送至 特定client
          if(! this.vistorId) {
            this.$message({
              type: 'error',
              message: '设备未开启'
            })
            return;
          }
          
          var topic = "vistor/create_ticket/" + this.vistorId;
          var content = {
            name: this.ruleForm.name,
            clientId: this.vistorId,
            identity: this.ruleForm.identity,
            bodyTem: this.ruleForm.bodyTem,
            position: this.ruleForm.position,
            status: this.ruleForm.status
          }
          // 订阅门票创建响应主题
          this.create_ticket_response = "ticket/create_ticket_response/" + this.vistorId;
          this.client.subscribe(this.create_ticket_response); // 这里雀食成功订阅到了
          // 发送门票信息给游客设备
          this.client.publish(topic, JSON.stringify(content), (err) => {
            if(err){
              this.$message({
                type: 'error',
                message: '门票创建错误'
              })
              // 不合理 解决方法：timeout 
            }
            setTimeout(() => {
              // 检查status
              if(this.status) {
                this.createTicket(content);
                this.status = '';
              }
              else {
                this.$message({
                  type: 'error',
                  message: '设备未开启'
                })
              }
            }, 1000)
          })
        } else {
          this.$message({
            type: 'error',
            message: '门票创建失败'
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
            message: '门票创建失败'
          })
        }
      }).catch( err => {
          this.$message({
            type: 'error',
            message: err
          })
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