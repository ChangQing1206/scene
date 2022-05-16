<template>
    <div id="container">
      <audio ref="audio"  :src="url"></audio>
      <el-row :gutter="20" class="toolBar">
        <el-col :span="2">
          <!-- 地图中心显示 -->
          <el-tooltip class="item" effect="dark" content="开启景区自适应功能，显示地图中心" placement="top-start">
            <el-input v-model="center_pos"  placeholder="中心坐标"></el-input>
          </el-tooltip>
        </el-col>
        <el-col  :span="2">
          <el-tooltip class="item" effect="dark" content="点击查看各景点的游客数量" placement="top-start">
            <el-badge :value="vistor_quatity" class="item">
              <!-- <el-button type="success" plain size="big">当前游客数量</el-button> -->
              <el-popover
                placement="right"
                width="400"
                trigger="click">
                <el-table :data="gridData">
                  <el-table-column width="150" property="scene_point_name" label="景点名称"></el-table-column>
                  <el-table-column width="100" property="number" label="游客数量"></el-table-column>
                  <!-- <el-table-column width="300" property="address" label="地址"></el-table-column> -->
                </el-table>
                <el-button type="success" plain slot="reference">游客数量</el-button>
              </el-popover>
            </el-badge>
          </el-tooltip>
        </el-col>
        <el-col :span="2">
          <el-tooltip class="item" effect="dark" content="点击查看预警消息" placement="top-start">
            <el-badge :value="warn_msg_quatity" class="item">
              <el-button type="warning" @click="drawer = true" plain size="big">预警消息</el-button>
            </el-badge>
          </el-tooltip>
        </el-col>

        <el-col :span="2">
          <el-tooltip class="item" effect="dark" content="点击查看求助消息" placement="top-start">
            <el-badge :value="help_msg_quatity" class="item">
              <el-button type="danger" @click="drawer1 = true" plain size="big">求助消息</el-button>
            </el-badge>
          </el-tooltip>
        </el-col>
        <el-col :span="10">
          <!-- 按手机号或者姓名 -->
          <el-tooltip class="item" effect="dark" content="您可以在这输入游客的姓名或手机号，快速定位该游客位置" placement="top-start">
  
            <el-input placeholder="请输入内容" type="text" v-model="search_content" class="input-with-select">
              <el-select style="width:120px;" v-model="select" slot="prepend" placeholder="请选择">
                <el-option label="姓名" value="1"></el-option>
                <el-option label="手机号" value="2"></el-option>
              </el-select>
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
              <el-button slot="append" @click="search_pos" icon="el-icon-search"></el-button>
            </el-input>
          </el-tooltip>
        </el-col>
        <el-col :span="3" >
          <el-dropdown trigger="click"  type="primary" :disabled="state" @command="handleClick" >
            <el-button type="primary" @click="isAdmin">
              功能菜单<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1">禁区围栏</el-dropdown-item>
              <el-dropdown-item command="2">景点围栏</el-dropdown-item>
              <el-dropdown-item command="3">距离测量</el-dropdown-item>
              <el-dropdown-item command="4">限定/取消限定景区</el-dropdown-item>
              <el-dropdown-item command="5">路径规划</el-dropdown-item>
              <el-dropdown-item command="6">撤消围栏</el-dropdown-item>
              <el-dropdown-item command="7">景区自适应</el-dropdown-item>
              <el-dropdown-item command="8">删除路径规划</el-dropdown-item>

            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>

      <el-drawer
        title="预警消息"
        :visible.sync="drawer"
        :direction="direction"
        :before-close="handleClose"
        size="30%">
        <div >
          <el-tabs stretch v-model="activeName" @tab-click="recv_msg">
          <!-- warn_msg_unread.length   warn_msg_readed.length -->
          
            <el-tab-pane :label="`未读消息（${warn_msg_unread.length}）`" name="first">
              <el-table
                :data="warn_msg_unread"
                border
                style="width: 100%">
                <el-table-column
                  fixed
                  prop="time"
                  label="时间"
                  width="120">
                </el-table-column>
                <el-table-column
                  fixed
                  prop="name"
                  label="姓名"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="identity"
                  label="手机号"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="content"
                  label="消息"
                  width="150">
                </el-table-column>
                <el-table-column
                  fixed="right"
                  label="操作"
                  width="90">
                  <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" content="点击查看后，你可以定位到该游客位置" placement="top-start">
                      <el-button @click="handle_view(scope.row)" type="text" size="small">查看</el-button>
                    </el-tooltip>
                    <!-- <el-button type="text" size="small">编辑</el-button> -->
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          
          
          <el-tab-pane :label="`已读消息（${warn_msg_readed.length}）`" name="second">
              <el-table
                :data="warn_msg_readed"
                border
                style="width: 100%">
                <el-table-column
                  fixed
                  prop="name"
                  label="姓名"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="identity"
                  label="手机号"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="content"
                  label="消息"
                  width="120">
                </el-table-column>
                <el-table-column
                  fixed="right"
                  label="操作"
                  width="100">
                  <template slot-scope="scope">
                    <el-button @click="handle_delete(scope.row)" type="danger" size="small">删除</el-button>

                  </template>
                </el-table-column>
              </el-table>
          </el-tab-pane>
        </el-tabs>
        </div>
      </el-drawer>


      <el-drawer
        title="求助消息"
        :visible.sync="drawer1"
        :direction="direction"
        :before-close="handleClose"
        size="25%">
        <div >
          <el-tabs stretch="true" v-model="activeName" @tab-click="recv_help">
          <!-- warn_msg_unread.length   warn_msg_readed.length -->
          
            <el-tab-pane :label="`未读消息（${help_msg_unread.length}）`" name="first">
              <el-table
                :data="help_msg_unread"
                border
                style="width: 100%">
                <el-table-column
                  fixed
                  prop="name"
                  label="姓名"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="identity"
                  label="手机号"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="content"
                  label="消息"
                  width="120">
                </el-table-column>
                <el-table-column
                  fixed="right"
                  label="操作"
                  width="100">
                  <template slot-scope="scope">
                    <el-button @click="handle_help(scope.row)" type="text" size="small">查看</el-button>
                    <!-- <el-button type="text" size="small">编辑</el-button> -->
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          
          
          <el-tab-pane :label="`已读消息（${help_msg_readed.length}）`" name="second">
              <el-table
                :data="help_msg_readed"
                border
                style="width: 100%">
                <el-table-column
                  fixed
                  prop="name"
                  label="姓名"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="identity"
                  label="手机号"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="content"
                  label="消息"
                  width="120">
                </el-table-column>
                <el-table-column
                  fixed="right"
                  label="操作"
                  width="100">
                  <template slot-scope="scope">
                    <el-button @click="handle_delete1(scope.row)" type="danger" size="small">删除</el-button>

                  </template>
                </el-table-column>
              </el-table>
          </el-tab-pane>
        </el-tabs>
        </div>
      </el-drawer>
      <!-- 搜索出来的游客 -->
      <template  v-for="(item,index) in search_result">
        <el-descriptions size="small"   title="查询结果" :column="4" border :key="index" >
          <el-descriptions-item label="游客姓名" label-class-name="my-label" content-class-name="my-content">{{item.name}}</el-descriptions-item>
          <el-descriptions-item label="手机号" label-class-name="my-label" >{{item.identity}}</el-descriptions-item>
          <el-descriptions-item label="位置" label-class-name="my-label" >{{item.position}}</el-descriptions-item>
          <el-descriptions-item label="操作" label-class-name="my-label" contentStyle="display:flex; justify-content: center; align-item: center;">
            <!-- <el-tag size="small">学校</el-tag> -->
            <el-button type="danger" @click="sixin" size="small">私信</el-button>
            <el-button type="primary" @click="reset_search" size="small">RESET</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      
      <el-dialog
        title="私信"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handle_private_msg_close">
        <el-input type="text" v-model="private_msg" placeholder="请输入您想向游客发送的信息"></el-input>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="send_private_msg">确 定</el-button>
        </span>
      </el-dialog>


      <div id="map_container">

      </div>
    </div>
</template>

<script>
/**
 * 1.消息列表
 * 2.路径规划
 * 3.位置分析
 * 4.消费分析
 * 5.拥堵分析  统计各个景点的游客数量
 *
 * 
 * 
 */

// 2.进入禁区提醒
// 3.进入景区提醒
// 4.体温报警
// 5.私信
// 6.统计各景点游客的数量
// 7.提醒各景点情况

// 在vue里面高德地图的icon的image 使用本地图片的问题
import health_icon from '@/assets/img/health.png'
import danger_icon from '@/assets/img/danger.png'
import warn_icon from '@/assets/img/warn.png'

// 添加安全密钥  (坑)
window._AMapSecurityConfig = {
  securityJsCode: "e0bf195629b935158df189360420b288"
}

import AMapLoader from '@amap/amap-jsapi-loader';
import vistor from '@/utils/vistor';
import {updateScene} from '@/api/api'
import GPS from "@/utils/gpsTogcj"
// 用于存储景区电子围栏
// import store from '@/store/store'
// var vistor = require('@/utils/vistor')
import * as mqtt from "mqtt";
// 设置为全局变量 否则vue将要消耗大量性能  因为不需要对游客对象实时监听
// 当mqtt客户端接收到消息后，直接取值赋值给labelmaker创建地图实例
// 1.创建labelmaker 无影响
// 2.更新labelmaker 无影响
// 这是游客对象
var vistors = new Map();
vistors.set("000000002", {clientId: "000000002", name: "黄晰维", identity: "19875915834", bodyTem: 27, position: [113.085721,22.594624], visited_point: []})
var amap = null;
var map = null;
var layer = null;
// 这是游客标记  因为可以直接获取markers
// var vistors_model = [];  
// 因为不频繁更新所以可以放data
// var mousetool = new amap.MouseTool(map);
var mousetool = null;
var overlays = [];
// var overlay = '';
// mousetool.on("draw", function(e) {
//   overlay.push(e.obj);
// })
var ruler = null; 
export default {
  data() {
    return{
      client: '',
      limit: false,
      url: '', // 这是语音的url
      search_content: '',
      center_pos: '',
      select: '',  // 按姓名还是手机号搜索
      vistor_quatity: 0,
      scene_point: [],
      start_pos: '',
      end_pos: '',
      private_msg: '',   // 发送给游客的私人消息
     // search_result: {name: "", identity: "", position: ""},
      search_result: [{name: "none", identity: "none", position: "none"}],
      drawer: false,
      walking: '',   // 路径规划对象
      direction: "rtl",
      clientId: '',
      activeName: 'first',
      dialogVisible: false,
      help_addr: [113.08606,22.600485], // 救援室的位置
      drawer1: false,
      warn_msg_unread: [], // 未读预警消息
      warn_msg_readed: [],  // 已读预警消息
      help_msg_unread: [], // 未读求助消息
      help_msg_readed: [], // 已读求助消息
      state: false,
      gridData: []    // [{name: '', num: 1}]
      // AMap: null,   // AMap 类
      // map: null,    // 地图对象
      // labelsLayer: null,  // LabelsLayer 图层对象
      // vistors: new Map(),  // 游客Map数据结构，维护景区游客的信息 // 不合理
    } 
  },
  mounted() {
    this.initMap();
  //  setInterval(this.update_vistors_model, 5000); // 定时器 6分钟更新一次
  },
  computed: {
    warn_msg_quatity:function() {
      return this.warn_msg_readed.length + this.warn_msg_unread.length
    },
    help_msg_quatity:function() {
      return this.help_msg_unread.length + this.help_msg_readed.length
    }
  },
  methods:{
    // 获取AMap类
    initMap() {
      AMapLoader.load({
        key:"9909d8d88b176d44601f698bcea8e29a",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version:"2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins:["AMap.MouseTool", "AMap.RangingTool", "AMap.Walking"],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then((AMap)=>{
        // 直接将AMap保存出来 因为不止创建地图需要她
        amap = AMap;
        this.createMap();
        this.initLabelLayers();
        mousetool = new amap.MouseTool(map);
        // mousetool.on("draw", function(e) {
        //   // overlay = e.obj;
        //   // console.log(e.obj.getOptions());
        //   overlays.push(e.obj);
        //   // 判断是否是景区电子围栏,如果是的话,则写入 Vuex
        //   // store.state.scenePoint = e.obj;
        //   // 而且应该要在初始化时,将AMap.GeometryUtil.isPointInRing函数存储到Vuex
        //   alert("你可以通过功能菜单的撤销围栏撤销最新绘制的围栏")
        // });
        ruler = new amap.RangingTool(map); 
        ruler.on("end", function(target, polyline, points, distance) {
          ruler.turnOff();
          alert("测量工具已关闭")
        })
        this.initMqtt();
        // 初始化walking对象
        this.walking = new amap.Walking({
            map: map,
        });
      }).catch(e=>{
        console.error('error: ',e);
      })
    },
    // 初始化地图
    createMap() {
      map = new amap.Map("map_container",{  //设置地图容器id
        viewMode:"2D",    //是否为3D地图模式
        zoom:16,           //初始化地图级别
        center:[113.085721,22.594624], //初始化地图中心点位置
      });
    },
    // 初始化labellayers 
    initLabelLayers() {
        layer = new amap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        // 该层内标注是否避让
        collision: false,
        // 设置 allowCollision：true，可以让标注避让用户的标注
        allowCollision: true,
      });
      // 将图层添加到地图上
      map.add(layer);
    },
    // 初始化mqtt客户端
    initMqtt() {
      // 1.连接mqtt服务器
      this.client = mqtt.connect("ws://localhost:3012");
      // 2.订阅创建游客标记的主题，处理游客的创建
      this.client.subscribe("vistor/create_vistor_model");
      // 3.订阅游客数据上传的主题，处理游客的数据上传
      this.client.subscribe("vistor/update_vistor_model");
      // 4.订阅销毁游客标记的主题，处理游客的销毁
      this.client.subscribe("vistor/destroy_vistor_model");
      // 5.订阅游客求助的主题，处理游客的求助
      this.client.subscribe("vistor/vistor_get_help");
      // 6.等待mqtt服务器回应,根据topic的类型，选择不同的处理方法  优化：策略模式
      this.client.on("message", (topic, payload) => {
        // client.end();
        switch(topic) {
          // 游客创建 立刻更新
          case "vistor/create_vistor_model":
            this.createVistor(payload);
            break;
          case "vistor/update_vistor_model":
            this.updateVistor(payload);
            break;
          case "vistor/destroy_vistor_model":
            this.destroyVistor(payload);
            break;
          case "vistor/vistor_get_help":
            this.helpVistor(payload);
            break;
          default:
            alert("主题错误,没有该主题");
            break;
        }
      });
    },
    createVistor(v) {
      this.vistor_quatity ++;
      // 更改写法 使用 JSON.stringify():对象转字符串 JSON.parse()字符串解析为对象
      console.log(v.toString())
      v = JSON.parse(v.toString());
      console.log("创建游客模型")
      console.log(v);
      var clientId = v.clientId;  // 客户端id必须要的
      this.clientId = v.clientId;  // 保存id
      var identity = v.identity; // 身份证
      var name = v.name; // 姓名
      var bodyTem = v.bodyTem; // 体温
      var position = v.position; // 位置
      var mark = GPS.gcj_encrypt(
          Number(position[1]),
          Number(position[0]))
      console.log(mark)
      // 时间不需要在这里存储
      var person = new vistor(identity, name, bodyTem, [mark.lon, mark.lat], new Array());
      // 键：clientId 值：游客对象
      // 调用游客对象的创建游客标记方法，在地图上创建标记  不合理
      // 新建的游客对象添加进游客map visited_point
      vistors.set(clientId, person);
      // 更新游客标记
      this.creat_vistor_model(person);
    },
    creat_vistor_model(p) {
      console.log(p)
      console.log("开始创建游客模型")
      // 设置图标对象
      var icon = {
        // 图标类型，现阶段只支持 image 类型
        type: 'image',
        // 图片 url
        image: health_icon,  // require("../assets/img")
        size: [32, 32],
        anchor: 'bottom-center',
      }
      console.log(icon);
      // 设置文本对象
      var text = {
        // 要展示的文字内容
        content: p.name + ' ' + p.identity + ' ' + p.bodyTem,
        // 文字方向，有 icon 时为围绕文字的方向，没有 icon 时，则为相对 position 的位置
        direction: 'top',
        // 在 direction 基础上的偏移量
        offset: [0, 0],
        // 文字样式
        style: {
            // 字体大小
            fontSize: 12,
            // 字体颜色
            fillColor: '#000000',
            // 描边颜色
            strokeColor: '#fff',
            // 描边宽度
            strokeWidth: 2,
        }
      }
      // GPS 转换为 GCJ

      //text.content = p.name + ' ' + p.bodyTem; // 展示内容为：游客姓名 + 游客体温
      var marker = new amap.LabelMarker({
        name: p.identity, // 此属性非绘制文字内容，仅最为标识使用  用于更改颜色
        position: p.position,
        zIndex: 13,
        // 将第一步创建的 icon 对象传给 icon 属性
        icon: icon,
        // 将第二步创建的 text 对象传给 text 属性
        text: text,
      }); 
      // 将marker添加到layer图层
      console.log("游客marker")

      layer.add(marker);
      setInterval(this.update_vistors_model,3000);
    },
    updateVistor(p) {
     // this.vistor_quatity = vistors.length
      p = JSON.parse(p.toString());
      // 根据游客身份证获取对象
      var person = vistors.get(p.clientId);
      if(!person) return;
      // 体温更新 位置更新  lat lon
      var mark = GPS.gcj_encrypt(
      Number(p.position[1]),
      Number(p.position[0]))
      person.bodyTem = p.bodyTem;
      person.position = [mark.lon, mark.lat];

      if(p.bodyTem > 31) {
        // 通报异常
        //console.log("异常tongbao");
        this.say("游客" + p.name + "的体温异常, 请做好防疫措施");
        // 更改颜色
        var allmarkers = layer.getAllOverlays('marker');  // getPosition()  getIcon().image   getName()  // 获取identity
        // 通知游客  vistor/bodyTem_exception/000000001
        this.client.publish("vistor/bodyTem_exception/" + p.clientId, JSON.stringify({message: "body temperature exception"}), function() {})
        for(var i = 0; i < allmarkers.length; i++) {
          if(allmarkers[i].getName() == p.identity) {
            allmarkers[i].getIcon().image = warn_icon; // 替换图标
            layer.add(allmarkers[i])
            break;
          }
        }

      }

    },
    say(text) {
      // 改变url
      this.url = "https://tts.youdao.com/fanyivoice?word=" + text + "&le=zh&keyfrom=speaker-target";
      // 播放语音
      this.$refs['audio'].play();
    },
    // 监控平台6分钟更新一次
    update_vistors_model() {
      this.gridData.length = 0; // 数组清零
      
      console.log("监控平台开始更新");
      // 1.先清空地图的游客标记
      // 移除labelLayers图层上的所有marker
      layer.clear();
      // 2.根据vistors游客对象重新创建marker
      var icon = {
        type: 'image',
        image: health_icon,
        size: [32, 32],
        anchor: 'bottom-center',
      }
      // 设置文本对象
      var text = {
        content: '',
        direction: 'top',
        offset: [0, 0],
        style: {
          fontSize: 12,
          fillColor: '#000000',
          strokeColor: '#fff',
          strokeWidth: 2,
        }
      }
      
      // 3.遍历map，创建marker   map   key : clientid   value: person
      var markers = [];
      for (var [key, value] of vistors) {
        text.content = value.name + ' ' + value.bodyTem; 
        var marker = new amap.LabelMarker({
          name: value.identity, // 此属性非绘制文字内容，仅最为标识使用
          position: value.position,
          zIndex: 13,
          icon: icon,
          text: text,
        })
        markers.push(marker);

      }
      // 一次性将游客marker添加到labelsLayer图层
      layer.add(markers);


      // 判断游客是否进入了电子围栏区域，提示游客和管理员
      // 外层：电子围栏区域
      for(var i = 0; i < overlays.length; i++) {
        // 内层：游客
        var num = 0;
        for(var [clientId, vistor] of vistors) {
          if(overlays[i].getOptions().extData.info == "危险地区" && overlays[i].contains([vistor.position[0], vistor.position[1]])) {
            // 通知游客
            // 1.制作游客的topic
            var topic_danger = "vistor/enter_dangerArea/" + clientId;
            // 2.警报信息
            var danger_tip = "游客" + vistor.name + "已经进入了危险地区";
            this.say(danger_tip);
            // 3.发送给对应的游客
            this.client.publish(topic_danger, "enter danger area", function(err) {
              console.log(err);
            })
            // 4.添加到预警数组  {time: "11:34:29", name: "黄晰维", identity: "19875915834", content: "掉水了"}
            var time = new Date();
            
            this.warn_msg_unread.push({time: time.toString().slice(16, 24), name: vistor.name, identity: vistor.identity, content: "进入了危险地区"});
          }
          else if(overlays[i].getOptions().extData.info != "危险地区" && overlays[i].contains([vistor.position[0], vistor.position[1]])) {
            // 1.制作游客的topic
            var topic_scene = "vistor/enter_scenePoint/" + clientId;
            var scenePoint = overlays[i].getOptions().extData.info;
            // 2.警报信息
            //var scene_tip = "你已经进入" + scenePoint + "景点";
            // 需要统计各个景点的游客数量
            num = num + 1; // 游客数量+1
            //this.say(scene_tip);
            console.log("=============================")
            console.log(vistor.visited_point)
            if(!vistor.visited_point.includes(scenePoint)) {
              // 第一次进入景点提醒
              this.client.publish(topic_scene, JSON.stringify({addr: scenePoint}), function(err) {
                console.log(err);
              })
              // 记录游客去过的景点
              vistor.visited_point.push(scenePoint)
              this.updateScene(clientId, vistor.name, scenePoint);
            }
            else {
              //
            }
          }

        }
        // 统计各景点的游客数量
        if(overlays[i].getOptions().extData.info != "危险地区" ) {
          this.gridData.push({scene_point_name: scenePoint, number: num})
        }
      }
    },
    updateScene(id, scene) {
      updateScene({clientId: id, sceneVisited: scene}).then(res => {
        if(res.status == 1) {
          console.log("游客去过的景点更新成功");
        }
      }).catch(err => {
        console.log(err);
      })
    },
    // 销毁游客实例，1.从vistors map对象删除  2.从vistors_model数组移除  3.从labelLayer移除
    destroyVistor(p) {
      this.vistor_quatity --;
      // 1.从vistors map对象删除
      vistors.delete(p.clientId);
      // 2.从vistors_model数组移除
      var index;
      // 获取markers
      var markers = layer.getAllOverlays('marker');
      for(var i = 0; i < markers.length; i++) {
        if(markers[i].name== p.clientId) {
          index = i;
          break;
        }
      }
      if(index == markers.length) {
        alert("该游客不存在");
      }
      else {
        // 3.将要销毁的游客marker从labelsLayer图层删除
        layer.remove(markers[index]);
      }
    },
    helpVistor(payload) {
      var p = JSON.parse(payload.toString());
      // 游客求助消息
      var msg = {
        name: p.name,
        identity: p.identity,
        content: p.content     // 求助内容
      }
      this.help_msg_unread.push(msg)
      
    },
    open() {
      this.$prompt('请输入景点名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        this.$message({
          type: 'success',
          message: '添加了' + value + '景点'
        });
    //    this.scene_point.push(value);
        var opt_scene = {
          fillColor: '#67C23A',
          extData: {info: value}
        }
        this.draw(opt_scene);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        });       
      });
    },
    handleClick(command) {
      switch(command) {
        case "1":
          var opt_danger = {
            fillColor: '#F56C6C',
            extData: {
              info: '危险地区'
            }
          }
          this.draw(opt_danger);
          break;
        case "2":
          this.open()
          break;
        case "3":
          this.distance_messure();
          break;
        case "4":
          this.set_scene();
          break;
        case "5":
          this.generate_way();
          break;
        case "6":
          this.clear_draw();
          break;
        case "7":
          this.set_fit_view();
          break;
        case "8":
          this.clear_route();
          break;
        default:
          alert("无该功能");
      }
    },
    draw(opt) {
      mousetool.on("draw", this.draw_cb);
      mousetool.polygon(opt);
    },
    draw_cb(e) {
      console.log(e.obj)
      overlays.push(e.obj);
      this.$message({
        type: 'success',
        message: "你可以通过功能菜单的撤销围栏撤销最新绘制的围栏"
      })
      mousetool.close();  // 关闭鼠标操作
      //mousetool.off("draw", this.draw_cb)
    },
    distance_messure() {
      alert("测量工具已开启")
      ruler.turnOn();
    },
    set_scene() {
      if(!this.limit){
        var bounds = map.getBounds();
        map.setLimitBounds(bounds);
        alert("限定景区显示范围已开启");
        this.limit = ~this.limit;
      }
      else {
        map.clearLimitBounds();
        alert("限定景区显示范围已关闭");
        this.limit = ~this.limit;
      }
    },
    generate_way() {
      //为地图注册dblclick事件获取鼠标点击出的经纬度坐标
      // var start;
      // var end;
      
      this.$message({
        type: "success",
        message: '请双击地图选择路径规划起点和终点'
      })

      map.on('click', this.cb);

    },
    cb(e) {
          // document.getElementById("lnglat").value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
        if(this.start_pos === '') {
          this.start_pos = [e.lnglat.getLng(), e.lnglat.getLat()]
          this.$message({
            type: "success", 
            message: '起点坐标为 ' + this.start_pos
          })
        }else {
          this.end_pos = [e.lnglat.getLng(), e.lnglat.getLat()]
          this.$message({
            type: "success", 
            message: '终点坐标为 ' + this.end_pos + ' 开始生成路径'
          })

          //根据起终点坐标规划步行路线
          this.walking.search(this.start_pos, this.end_pos, function(status, result) {
            //console.log(result)
              // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
              if (status === 'complete') {
                //console.log(status)
              } else {
//
              } 
          });
        this.start_pos = '';
        this.end_pos = '';
    }
    },
    clear_route() {
      this.walking.clear();
      map.off('click', this.cb);
    },
    clear_draw() {
      map.remove(overlays.pop());
    },
    // 设置地图自适应
    set_fit_view() {
      map.setFitView(null, false, [150, 60, 100, 60]);
      var newCenter = map.getCenter();
      this.center_pos = newCenter.toString();
    },
    // 查看预警未读消息
    recv_msg(tab, event) {
      //console.log(tab, event);
      
    },
    // 查看求助信息
    recv_help() {

    },
    handleClose(done) {
      this.$confirm('确认关闭？')
      .then(_ => {
        done();
      })
      .catch(_ => {});
    },
    handle_view(row) {
      // 点击查看后 将消息添加至已读
      // 从未读数组中移除该消息
      var pos;
      //console.log(row)  // [{name: "sss", identity: 19875915834, content: ""}, {}]
      this.warn_msg_unread = this.warn_msg_unread.filter((item) => {
        return item.identity !== row.identity
      })

      // 加入已读数组
      //this.warn_msg_readed.push();
      this.warn_msg_readed.push(row);
      // 顺便定位游客
      vistors.forEach((item) => {
        if(item.identity === row.identity)
        {
          // 
          pos = item.position;
          var m = new amap.Marker({
            position: item.position
          });
          map.setFitView([m])
        }
      })

      // 是否需要生成救援路径
      this.$confirm('是否生成救援路径？默认起点是救援室，您也可以通过功能菜单的路径规划生成', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }).then(() => {
          // 生成路径  北门坐标  113.08606,22.600485    玫瑰园  113.085721,22.594624

            this.walking.search(this.help_addr, pos, function(status, result) {

              // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
              if (status === 'complete') {
                //
              } else {
//
              } 
          });

          this.$message({
            type: 'success',
            message: '生成路径成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '您没有生成路径'
          });          
        });

    },

    handle_delete(row) {
      this.warn_msg_readed = this.warn_msg_readed.filter((item) => {
        return item.identity !== row.identity
      })
    },
    handle_help(row) {
      var pos;
      this.help_msg_unread = this.help_msg_unread.filter((item) => {
        return item.identity !== row.identity
      })
      // 加入已读数组
      //this.warn_msg_readed.push();
      this.help_msg_readed.push(row);
            // 顺便定位游客
      vistors.forEach((item) => {
        if(item.identity === row.identity)
        {
          // 
          pos = item.position;
          var m = new amap.Marker({
            position: item.position
          });
          map.setFitView([m])
        }
      })
      // 是否需要生成救援路径
      this.$confirm('是否生成救援路径？默认起点是救援室，您也可以通过功能菜单的路径规划生成', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }).then(() => {
          // 生成路径  北门坐标  113.08606,22.600485    玫瑰园  113.085721,22.594624

            this.walking.search(this.help_addr, pos, function(status, result) {

              // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
              if (status === 'complete') {
                //
              } else {
//
              } 
          });

          this.$message({
            type: 'success',
            message: '生成路径成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '您没有生成路径'
          });          
        });

    },
    handle_delete1(row) {
      this.help_msg_readed = this.help_msg_readed.filter((item) => {
        return item.identity !== row.identity
      })
    },
    // 按游客姓名或者按手机号搜索
    search_pos() {
      if(localStorage.getItem("role") !== "管理员") {
        this.$message({
          type:'error',
          message: '你的权限不足'
        })
        return
      }
      this.search_result.length = 0;
      // 按姓名搜索
      if(this.select === '1') {

        vistors.forEach((item) => {
          if(item.name === this.search_content) {
            this.search_result.push(item);
          }
        })
        
      }
      // 按手机号搜索
      if(this.select === '2') {
        vistors.forEach((item) => {
          if(item.identity === this.search_content)
            this.search_result.push(item);
        })
      } 
      this.search_content = ""
      var arr = [];
      this.search_result.forEach((item) => {
        var m = new amap.Marker({
          position: item.position
        });
        arr.push(m)
      })
      map.setFitView(arr);
      arr.length = 0;
    },

    // 发送私人消息
    send_private_msg() {
      this.dialogVisible = false;
      // 发送私人消息
      this.client.publish("vistor/message_private/"+ this.clientId, JSON.stringify({message: this.private_msg}), function() {

      })
    },
    handle_private_msg_close(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },


    reset_search() {
      this.search_result = [{name: "none", identity: "none", position: "none"}]
    },
    isAdmin() {
      if(localStorage.getItem("role") !== "管理员") {
        this.$message({
          type: "error",
          message: "你的权限不足"
        })
        this.state = true
      }
    },
    sixin() {
      if(localStorage.getItem("role") != "管理员") {
        this.$message({
          type: "error",
          message: "你的权限不足"
        })
      }else {
        this.dialogVisible=true
      }
    }


    // 游客的基本信息插入数据库

  },
}
</script>

<style lang="less"  scoped>
  // @import '@/assets/css/common';
  #container{
    width: 100%;
    height: 100%;
    margin-top: 10px;
  }
  #map_container {
    
    width: 96%;
    height: 800px;
    margin: 0 auto;
    margin-top: 10px;
  }
  .toolBar {
    z-index: 1000;
  }
  .el-dropdown {
  //  z-index: 1000;
  //  vertical-align: top;
  }
  .el-dropdown + .el-dropdown {
    margin-left: 15px;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }

  .my-label {
    background: #E1F3D8;
    width: 100px;
  }

  .my-content {
    background: #FDE2E2;
  }
    .el-select .el-input {
    width: 130px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>