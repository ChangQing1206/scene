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
        <!-- <el-form-item label="游客经度" prop="positionLong">
          <el-input v-model="ruleForm.position[0]"></el-input>
        </el-form-item>
        <el-form-item label="游客纬度" prop="positionLati">
          <el-input v-model="ruleForm.position[1]"></el-input>
        </el-form-item> -->
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
    // var validateNumber = (rule, value, callback) => {
    //   if( typeof Number(value) == 'number') callback();
    //   else callback(new Error("体温必须为数字"));
    // }
    return {
      client: '', // 售票客户端
      vistorId: '',
      status: 0, // 门票创建响应状态
      create_ticket_response: '', 
      ready: 0,
      ruleForm: {
        name: '',
        identity: '',
        // bodyTem: '',
        // position: [113.086051,22.600441],
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
        // bodyTem: [
        //   { required: true, message: '请输入游客体温', trigger: 'blur'},
        //   { validator: validateNumber, message: '体温必须为数字'}
        // ]
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
      this.client.subscribe("ticket/ready");   // 用于出票设备出票
      this.client.subscribe("ticket/check");   // 用于门票验证  上传至服务器
      this.client.on('message', (topic, payload) => {
        console.log("==============")
        console.log(topic)
        switch(topic) {
          case "ticket/ready": 
//            alert("游客设备"+this.vistorId+"可以出票了");
            this.ready = 1;   // 已准备
            break;
          case "ticket/get_clientId":
            this.vistorId = payload.toString();  // 取到游客设备id
            alert("设备" + this.vistorId + "启动")
            break;
          case this.create_ticket_response:
//            var response = JSON.parse(payload.toString());
            this.status = 1;
            break;
          case "ticket/check":
            var check = JSON.parse(payload.toString())
            if(check.status == "using") {
              alert(check.name + "出票成功")
            }
//            this.checkTicket(check);
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
          // 暂时注释掉  先完成游客设备的调试
          // if(! this.ready) {
          //   this.$message({
          //     type: 'error',
          //     message: '出票设备未准备好'
          //   })
          //   return;
          // }
          
//          var topic = "vistor/create_ticket/" + this.vistorId;
          var topic = "vistor/create_ticket";
          var content = {
            name: this.ruleForm.name,
//            clientId: this.vistorId,
            identity: this.ruleForm.identity,
//            bodyTem: this.ruleForm.bodyTem,
//            position: this.ruleForm.position,
            status: this.ruleForm.status,
            amount: this.ruleForm.amount
          }
          // 订阅门票创建响应主题
//          this.create_ticket_response = "ticket/create_ticket_response/" + this.vistorId;
          this.create_ticket_response = "ticket/response"
          this.client.subscribe(this.create_ticket_response); // 这里雀食成功订阅到了
          // 发送游客信息给游客设备  便于后面上传
          this.client.publish("vistor/get_Message/" + this.vistorId, JSON.stringify({name: this.ruleForm.name, identity: this.ruleForm.identity}), function() {

          })
          // this.client.publish(topic, JSON.stringify(content), (err) => {
          //   if(err){
          //     this.$message({
          //       type: 'error',
          //       message: '门票创建错误'
          //     })
          //     // 不合理 解决方法：timeout 
          //   }
          //   setTimeout(() => {
          //     // 检查status
          //     if(this.status) {
          //       this.createTicket(content);
          //       this.status = 0;
          //     }
          //     else {
          //       this.$message({
          //         type: 'error',
          //         message: '出票失败'
          //       })
          //     }
          //   }, 2000)
          // })
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
    },
    checkTicket(check) {
      checkTicket(check).then(res => {
        if(res.status) {
          //
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