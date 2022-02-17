<template>
    <div id="container">
      <el-row :gutter="20">
        <el-col :span="3" :offset="21">
          <el-dropdown split-button type="primary" @command="handleClick">
            功能菜单
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1">禁区围栏</el-dropdown-item>
              <el-dropdown-item command="2">景点围栏</el-dropdown-item>
              <el-dropdown-item command="3">距离测量</el-dropdown-item>
              <el-dropdown-item command="4">限定/取消限定景区</el-dropdown-item>
              <el-dropdown-item command="5">游客求助路径规划</el-dropdown-item>
              <el-dropdown-item command="6">撤消围栏</el-dropdown-item>

            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import vistor from '@/utils/vistor';
import {updateScene} from '@/api/api'
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
      // AMap: null,   // AMap 类
      // map: null,    // 地图对象
      // labelsLayer: null,  // LabelsLayer 图层对象
      // vistors: new Map(),  // 游客Map数据结构，维护景区游客的信息 // 不合理
    } 
  },
  mounted() {
    this.initMap();
    
    // setInterval()的this 有问题
    setInterval(this.update_vistors_model, 30000); // 定时器 6分钟更新一次
  },
  methods:{
    // 获取AMap类
    initMap() {
      AMapLoader.load({
        key:"9909d8d88b176d44601f698bcea8e29a",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version:"2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins:["AMap.MouseTool", "AMap.RangingTool"],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then((AMap)=>{
        // 直接将AMap保存出来 因为不止创建地图需要她
        amap = AMap;
        this.createMap();
        this.initLabelLayers();
        mousetool = new amap.MouseTool(map);
        mousetool.on("draw", function(e) {
          // overlay = e.obj;
          // console.log(e.obj.getOptions());
          overlays.push(e.obj);
          // 判断是否是景区电子围栏,如果是的话,则写入 Vuex
          // store.state.scenePoint = e.obj;
          // 而且应该要在初始化时,将AMap.GeometryUtil.isPointInRing函数存储到Vuex
          alert("你可以通过功能菜单的撤销围栏撤销最新绘制的围栏")
        });
        ruler = new amap.RangingTool(map); 
        ruler.on("end", function(target, polyline, points, distance) {
          ruler.turnOff();
          alert("测量工具已关闭")
        })
        this.initMqtt();
      }).catch(e=>{
        console.error('error: ',e);
      })
    },
    // 初始化地图
    createMap() {
      map = new amap.Map("container",{  //设置地图容器id
        viewMode:"2D",    //是否为3D地图模式
        zoom:5,           //初始化地图级别
        center:[105.602725,37.076636], //初始化地图中心点位置
      });
    },
    // 初始化labellayers 
    initLabelLayers() {
        layer = new amap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        // 该层内标注是否避让
        collision: true,
        // 设置 allowCollision：true，可以让标注避让用户的标注
        allowCollision: true,
      });
      // 将图层添加到地图上
      map.add(layer);
    },
    // 初始化mqtt客户端
    initMqtt() {
      // 1.连接mqtt服务器
      this.client = mqtt.connect("ws://localhost:3010");
      // 2.订阅创建游客标记的主题，处理游客的创建
      this.client.subscribe("mqtt/create_vistor_model");
      // 3.订阅游客数据上传的主题，处理游客的数据上传
      this.client.subscribe("mqtt/update_vistor_model");
      // 4.订阅销毁游客标记的主题，处理游客的销毁
      this.client.subscribe("mqtt/destroy_vistor_model");
      // 5.订阅游客求助的主题，处理游客的求助
      this.client.subscribe("mqtt/vistor_help");
      // 6.等待mqtt服务器回应,根据topic的类型，选择不同的处理方法  优化：策略模式
      this.client.on("message", (topic, payload) => {
        // client.end();
        switch(topic) {
          // 游客创建 立刻更新
          case "mqtt/create_vistor_model":
            this.createVistor(payload);
            break;
          case "mqtt/update_vistor_model":
            this.updateVistor(payload);
            break;
          case "mqtt/destroy_vistor_model":
            this.destroyVistor(payload);
            break;
          case "mqtt/vistor_help":
            this.helpVistor(payload);
            break;
          default:
            alert("主题错误,没有该主题");
            break;
        }
      });
    },
    createVistor(v) {
      // 更改写法 使用 JSON.stringify():对象转字符串 JSON.parse()字符串解析为对象
      // var arr = v.toString().split(',');
      // console.log("游客对象创建成功");
      // console.log(arr);
      // console.log(arr);
      // 1.clientId 2.姓名 3.体温 4.充值 5.消费 6.消费产品名称 7.位置 8.位置
      v = JSON.parse(v.toString());
      var clientId = v.clientId;
      var name = v.name;
      var bodyTem = v.bodyTem;
      var deposit = v.deposit;
      var consume = v.consume;
      var goodsName = v.goodsName;
      var postion = v.position;
      var person = new vistor(clientId, name, bodyTem, deposit, consume, goodsName, postion[0], postion[1]);
      // 键：clientId 值：游客对象
      // 调用游客对象的创建游客标记方法，在地图上创建标记  不合理
      // 新建的游客对象添加进游客map
      vistors.set(clientId, person);
      // 更新游客标记
      this.creat_vistor_model(person);
    },
    creat_vistor_model(p) {
      // 设置图标对象
      var icon = {
        // 图标类型，现阶段只支持 image 类型
        type: 'image',
        // 图片 url
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        size: [18, 27],
        anchor: 'bottom-center',
      }
      // 设置文本对象
      var text = {
        // 要展示的文字内容
        content: '',
        // 文字方向，有 icon 时为围绕文字的方向，没有 icon 时，则为相对 position 的位置
        direction: 'right',
        // 在 direction 基础上的偏移量
        offset: [-20, -5],
        // 文字样式
        style: {
            // 字体大小
            fontSize: 12,
            // 字体颜色
            fillColor: '#22886f',
            // 描边颜色
            strokeColor: '#fff',
            // 描边宽度
            strokeWidth: 2,
        }
      }
      text.content = p.name + ' ' + p.bodyTem + ' ' + p.deposit + ' ' + p.consume + ' ' + p.goodsName; 
      var marker = new amap.LabelMarker({
        name: p.clientId, // 此属性非绘制文字内容，仅最为标识使用
        position: [p.positionLong, p.positionLati],
        zIndex: 16,
        // 将第一步创建的 icon 对象传给 icon 属性
        icon: icon,
        // 将第二步创建的 text 对象传给 text 属性
        text: text,
      });
      // 将marker添加到layer图层
      layer.add(marker);
    },
    updateVistor(p) {
      // var arr = p.toString().split(',');
      // console.log("接收到的游客数据")
      // console.log(arr);
      p = JSON.parse(p.toString());
      // 根据游客id获取对象
      var person = vistors.get(p.clientId);
      if(person == undefined) return;
      // 体温需要更新 
      person.bodyTem = p.bodyTem;
      // 充值金额需要更新
      person.deposit = p.deposit;
      // 消费金额需要更新
      person.consume = p.consume;
      // 消费产品需要更新
      person.goodsName = p.goodsName;
      // 经度需要更新
      person.positionLong = p.position[0];
      // 纬度需要更新
      person.positionLati = p.position[1];
      console.log("更改后的游客信息")
      console.log(vistors);
    },
    // 监控平台6分钟更新一次
    update_vistors_model() {
      console.log("监控平台开始更新");
      // 1.先清空地图的游客标记
      // 移除labelLayers图层上的所有marker
      layer.clear();
      // 2.根据vistors游客对象重新创建marker
      var icon = {
        type: 'image',
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        size: [6, 9],
        anchor: 'bottom-center',
      }
      // 设置文本对象
      var text = {
        // 要展示的文字内容
        content: '',
        // 文字方向，有 icon 时为围绕文字的方向，没有 icon 时，则为相对 position 的位置
        direction: 'right',
        // 在 direction 基础上的偏移量
        offset: [-20, -5],
        // 文字样式
        style: {
          // 字体大小
          fontSize: 12,
          // 字体颜色
          fillColor: '#22886f',
          // 描边颜色
          strokeColor: '#fff',
          // 描边宽度
            strokeWidth: 2,
        }
      }
      // 3.遍历map，创建marker 
      var markers = [];
      for (var [key, value] of vistors) {
        text.content = value.name + ' ' + value.bodyTem + ' ' + value.deposit + ' ' + value.consume + ' ' + value.goodsName; 
        var marker = new amap.LabelMarker({
          name: value, // 此属性非绘制文字内容，仅最为标识使用
          position: [value.positionLong, value.positionLati],
          zIndex: 16,
          // 将第一步创建的 icon 对象传给 icon 属性
          icon: icon,
          // 将第二步创建的 text 对象传给 text 属性
          text: text,
        })
        // console.log(marker);

        markers.push(marker);

      }
      // 一次性将游客marker添加到labelsLayer图层
      layer.add(markers);

      // 判断体温是否异常
      for(var [clientId, vistor] of vistors) {
        if(vistors.bodyTem > 37.3) {
          // 通知游客
        }
      }


      // 判断游客是否进入了电子围栏区域，提示游客和管理员
      // 外层：电子围栏区域
      for(var i = 0; i < overlays.length; i++) {
        // 内层：游客
        for(var [clientId, vistor] of vistors) {
          if(overlays[i].getOptions().extData.info == "危险地区" && overlays[i].contains([vistor.positionLong, vistor.positionLati])) {
            // 通知游客
            // 1.制作游客的topic
            var topic_danger = "mqtt/danger_tip/" + clientId;
            // 2.警报信息
            var danger_tip = "你已经进入了危险地区, 请离开";
            // 3.发送给对应的游客
            this.client.publish(topic_danger, danger_tip, function(err) {
              console.log(err);
            })
          }
          else if(overlays[i].getOptions().extData.info != "危险地区" && overlays[i].contains([vistor.positionLong, vistor.positionLati])) {
            // 1.制作游客的topic
            var topic_scene = "mqtt/scene_tip/" + clientId;
            var scenePoint = overlays[i].getOptions().extData.info;
            // 2.警报信息
            var scene_tip = "你已经进入" + scenePoint + "景点";
            // 3.发送给对应的游客
            this.client.publish(topic_scene, scene_tip, function(err) {
              console.log(err);
            })
            // 4.将去过的景点上传数据库 参数游客id 和 景点
            this.updateScene(clientId, scenePoint);
          }
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
    open() {
      this.$prompt('请输入景点名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        this.$message({
          type: 'success',
          message: '添加了' + value + '景点'
        });
        var opt_scene = {
          fillColor: '#67C23A',
          info: value
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
        default:
          alert("无该功能");
      }
    },
    draw(opt) {
      mousetool.polygon(opt);
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

    },
    clear_draw() {
      map.remove(overlays.pop());
    }
  },
}
</script>

<style lang="less"  scoped>
  // @import '@/assets/css/common';
  #container{
    padding:0px;
    margin: 0px;
    width: 100%;
    height: 800px;
  }
  .el-dropdown {
    z-index: 1000;
    vertical-align: top;
  }
  .el-dropdown + .el-dropdown {
    margin-left: 15px;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>