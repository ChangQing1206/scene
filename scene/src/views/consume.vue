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
              <el-option label="饮料" value="1"></el-option>
              <el-option label="零食" value="2"></el-option>
              <el-option label="热食" value="3"></el-option>
              <el-option label="特殊服务" value="4"></el-option>
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
              <el-button style="float: right; padding: 3px 0" @click="submitForm" type="text">立即扣费</el-button>
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
import { createOrder } from '@/api/api';
import headTop from '@/components/headTop'
export default {

  mounted() {
    // 初始化mqtt客户端
    console.log("消费系统开始")
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
      status: 0, // 门票创建响应状态
      ready: 0,
      select: '',  // 选择的商品类目
      search_res: [], // 搜索结果
      consumeGoods: [], // 消费的食物
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
      goods: {
        "鸡肉火腿肠": 2,
        "乐事薯片": 6.5,
        "康师傅酸菜牛肉面": 5,
        "奥利奥饼干": 3,
        "费列罗": 3,
        "大白兔": 0.5,
        "冰淇淋": 2,
        "麦丽素": 3,
        "无花果": 1.5,
        "卫龙辣条": 2,
        "沙琪玛": 1,
        "卤蛋": 1.5,
        "泡椒鸡脚": 2.5,
        "榴莲饼": 11,
        "三明治面包": 3.5,
        "香辣鱿鱼丝": 2.5,
        "绿豆沙": 3,
        "统一豚骨泡面": 5.5,
        "黄桃": 10,
      },
      hotFood: {
        "瘦肉鸡蛋肠粉": 5,
        "鸡蛋炒米粉": 7,
        "鸡蛋炒面": 7,
        "牛腩粉": 8,
        "云吞面": 7,
        "鸡蛋炒饭": 7,
        "青椒炒肉丝饭": 12,
        "酸辣土豆丝饭": 13,
        "梅菜扣肉饭": 15,
        "排骨河粉": 13,
        "猪杂汤粉": 10,
        "湿炒牛河": 12,
        "酸菜鱼饭": 15,
        "咖喱鸡扒饭": 13,
        "羊肉饺子": 18,
        "茄子肉沫饭": 12,
        "韭黄滑蛋饭": 11,
        "鸡腿饭": 10,
        "胡椒猪肚鸡饭": 13,
        "麻辣烫": 12,
        "酸辣鸡杂饭": 11,
        "柳州螺狮粉": 12,
        "烤串": 3,
      },
      special_service: {
        "钓鱼虾": 50,
        "摘水果": 50,
        "摘野菜": 50,
        "潜水": 40,
        "漂流": 50,
      },
      drinks: {
        "百事可乐": 7,
        "雪碧": 3.5,
        "脉动": 4.5,
        "果粒橙": 8,
        "营养快线": 4.5,
        "茉莉花茶": 3,
        "冰红茶": 4.5,
        "乌龙茶": 3,
        "椰树牌椰奶": 11.5,
        "娃哈哈AD钙奶": 3,
        "旺仔牛奶": 4,
        "美年达": 3,
        "芬达": 5,
        "蒙牛": 3.5,
        "农夫山泉":2.5,
        "怡宝":2,
        "和其正": 3,
        "加多宝": 3,
        "纯悦": 1.5, 
        "雀巢咖啡":3,
        "冰糖雪梨": 4.5,
        "天地壹号": 18,
        "青岛啤酒": 4.5,
        "珠江啤酒": 4.5,
        "维他柠檬茶": 4.5,
        "雪花啤酒": 4.5,
        "百威啤酒": 5,
        "乌苏": 8,
        "七喜": 5,
        "银鹭花生牛奶": 3.5,
        "二锅头": 10,
        "珍珠奶茶": 7,
        "杨枝甘露": 13,
      },
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
            var vdata = JSON.parse(payload.toString);
            if(vdata.state === 2) {
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
            if(JSON.parse(payload.toString()).state === 1) {
              // 添加到数据库
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
      if(! this.ready) {
        this.$message({
          type: 'error',
          message: '消费设备未准备好'
        })
        return;
      }
      this.cardShow = true;
      this.accountMoney();
    },
    accountMoney() {
      this.consumeGoods.forEach(item => {
        this.consumeValue += item.addPrice
      })
    },
    submitForm() {
      this.cardShow = false;
      // 发送游客信息给游客设备  便于后面上传
      this.client.publish("vistor/consume_goods", JSON.stringify({amount: this.consumeValue}), function() {

      })

    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    first_se() {
      this.search_res.length = 0;
      if(this.select === '1') {
        this.search_res = Object.keys(this.drinks)
        this.foodType = "饮料"
      }
      if(this.select === '2') {
        this.search_res = Object.keys(this.goods)
        this.foodType = "零食"
      }
      if(this.select === '3') {
        this.search_res = Object.keys(this.hotFood)
        this.foodType = "热食"
      }
      if(this.select === '4') {
        this.search_res = Object.keys(this.special_service)
        this.foodType = "休闲服务"
      }
    },
    
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
            message: "软件扣费失败"
          })
        }
      })
    },
    // 添加购物车
    addShopCar() {
      if(this.select === '1') {
        this.price = this.drinks[this.value]
      }
      if(this.select === '2') {
        this.price = this.goods[this.value]
      }
      if(this.select === '3') {
        this.price = this.hotFood[this.value]
      }
      if(this.select === '4') {
        this.price = this.special_service[this.value]
      }
      this.consumeGoods.push({"foodName": this.value,"foodType":  this.foodType, "singlePrice": this.price, "number": this.num, "addPrice": this.price * this.num})
      this.$message({
        type: "success",
        message: "添加购物车成功!"
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