<template>
  <div class="fillcontain">
    <!-- 消费系统 -->
    <!-- 把卡放上 获取游客信息  -->
    <head-top></head-top>
    <div class="consume-area lr_in">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="游客姓名" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="游客手机号" prop="identity">
          <el-input v-model="ruleForm.identity"></el-input>
        </el-form-item>
        <el-form-item label="余额" prop="amount">
          <el-input v-model="ruleForm.amount"></el-input>
        </el-form-item>
        <el-form-item label="门票状态" prop="status">
          <el-input v-model="ruleForm.status"></el-input>
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName" class="pos">

          <div class="search">
            <el-select v-model="select" @change="first_se" class="goodsType" slot="prepend" placeholder="商品类目">
              <el-option v-for="(item, index) in this.goodsData" :key="index" :label="item._id" :value="item.goods"></el-option>
            </el-select>

          <el-select v-model="value" style="width: 200px;" filterable>
            <el-option
              v-for="(item, index) in search_res"
              :key="index"
              :label="item"
              :value="item">
            </el-option>
          </el-select>


          <el-input-number style="width: 130px;" v-model="num" :min="1" :max="10" label="描述文字"></el-input-number>
          <el-tooltip class="item" effect="dark" content="添加至购物车" placement="top-start">
            <div  @click="addShopCar" class="car"><i class="el-icon-shopping-cart-2"></i></div>
          </el-tooltip>
          
        </div>
        </el-form-item>

        <el-popover
          placement="top"
          width="480"
          trigger="manual"
          v-model="cardShow">
          <el-card class="box-card" v-if="consumeGoods.length > 0">
            <div slot="header" class="clearfix">
              <span>购物车</span>
              <el-button style="float: right; padding: 3px 0" @click="submitForm()" type="text">立即扣费</el-button>
            </div>
            <div v-for="(item, index) in consumeGoods" :key="index" class="text item">
              {{ "商品名称:  " + item.foodName + "     "  + "商品单价:  " + item.singlePrice + "     " + "商品数量：  " + item.number + "     " + "累加价格：  " + item.addPrice}}
            </div>
            <div>总计金额: {{ this.consumeValue  }}</div>
          </el-card>
        </el-popover>

        <el-form-item>
          <el-button type="primary" @click="checkSubmit()">扣费</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    
  </div>
</template>


<script>
import * as mqtt from "mqtt";
import { createOrder, getGoods } from '@/api/api';
import headTop from '@/components/headTop'
export default {

  mounted() {
    // 初始化mqtt客户端
    console.log("消费系统开始")
    this.initMqtt();
    this.getGoods();
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
      status: 0, // 门票创建响应状态
      ready: 0,
      select: [],  // 选择的商品类目
      search_res: [], // 搜索结果
      consumeGoods: [], // 消费的食物
      goodsData: [],  // 商品数据
      value: '',
      cardShow: false,
      price: '',
      num: 0,
      consumeValue: 0,
      ruleForm: {
        name: '',
        identity: '',
        status: '',
        amount: '',
        goodsName: '',  // 商品名称
        goodsNum: '',    // 数量
        consumeValue: 0       // 
      },
      foodType: '',
      rules: {
      }
    }
  },
  components: {
    headTop
  },
  computed: {

  },
  
  methods: {
    initMqtt() {
      // 1.连接mqtt服务器
      this.client = mqtt.connect("ws://localhost:3012");
      
      // 2.订阅获取clientId的主题 获取clientId通信  用于游客设备通信
      this.client.subscribe("ticket/get_clientId");  // 用于游客设备通信
      this.client.subscribe("consume/ready");   // 消费准备
      this.client.subscribe("consume/response");   // 消费响应
      this.client.on('message', (topic, payload) => {
        switch(topic) {
          case "consume/ready": 
            console.log(payload.toString())
            var vdata = JSON.parse(payload.toString());
            if(vdata.state == 2) {
              // 取出数据
              this.ruleForm.name = vdata.name;
              this.ruleForm.identity = vdata.identity;
              this.ruleForm.amount = vdata.amount;
              this.ruleForm.status = vdata.status;
              this.$message({
                type: 'success',
                message: '消费设备已准备好'
              })
              this.ready = 1;   // 已准备
            }
            break;
          case "consume/response":
            var content = {
              name: this.ruleForm.name,
              identity: this.ruleForm.identity,
              consume: this.consumeValue,
              goods: this.consumeGoods
            }
            if(JSON.parse(payload.toString()).state == 1) {
              // 添加到数据库
              console.log(1)
              content.status = "支付成功";
              this.createOrder(content);
            }else {
              this.$message({
                type: "error",
                message: "硬件扣费失败"
              })
              content.status = "支付失败";
              this.createOrder(content);
            }

            break;
          default:
            alert("主题错误");
            break;
        }
      })
    },
    checkSubmit() {
      // if(! this.ready) {
      //   this.$message({
      //     type: 'error',
      //     message: '消费设备未准备好'
      //   })
      //   return;
      // }
      this.cardShow = true;
    },

    submitForm() {
      this.cardShow = false;
      var content = {
        name: this.ruleForm.name,
        identity: this.ruleForm.identity,
        consume: this.consumeValue,
        goods: this.consumeGoods
      }
      content.status = "支付成功";
      this.createOrder(content);
      // 
      
      this.client.publish("vistor/consume_goods", JSON.stringify({amount: String(this.consumeValue)}), function(err) {
        console.log(err)
      })
      this.consumeValue = 0;
      this.consumeGoods.length = 0;

    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    first_se() {

      this.search_res.length = 0;
      this.select.forEach(item => {
        this.search_res.push(item.goodsName)
      })
    },

    /*
    [
  { _id: 'fruit', goods: [ [Object] ] },
  { _id: 'hotFood', goods: [ [Object], [Object] ] },
  { _id: 'snack', goods: [ [Object], [Object], [Object] ] },
  { _id: 'drink', goods: [ [Object] ] },
  { _id: null, goods: [ [Object] ] },
  { _id: 'special_service', goods: [ [Object] ] }    

  goods: [ { goodsName: '百事可乐', goodsType: 'drink', price: 7 } ]
]
    */
    
    createOrder(order) {
      createOrder(order).then(res => {
        if(res.status) {
          this.$message({
            type: "success",
            message: "支付成功"
          })
        }else {
          this.$message({
            type: "error",
            message: res.message
          })
        }
      })
    },
    // 添加购物车
    addShopCar() {
      this.select.forEach(item => {
        if(item.goodsName == this.value) {
          this.price = item.price
        }
      })
      this.consumeGoods.push({"foodName": this.value,"foodType":  this.foodType, "singlePrice": this.price, "number": this.num, "addPrice": this.price * this.num})
      this.consumeValue += this.price * this.num
      this.$message({
        type: "success",
        message: "添加购物车成功!"
      })
      this.select.length = 0
    },
    getGoods() {
      getGoods().then(res => {
        if(res.status == 1) {
          this.goodsData = res.message
        }
      })
    }
  }

}
</script>

<style scoped>
  .el-select .el-input {
    width: 130px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
  .consume-area {
    width: 36%;
    margin-top: 150px;
  }
  .goodsType {
    width: 105px;
  }
  .search_res {
    width: 130px;
    height: 36px;
    
  }
  .search {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .car {
    margin-left: 10px;
    font-size: 28px;
  }
  .car:hover {
    cursor: pointer;
  }
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }

</style>