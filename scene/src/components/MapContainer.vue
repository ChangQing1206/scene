<template>
    <div id="container"></div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import vistor from '@/utils/vistor';
// var vistor = require('@/utils/vistor')
import * as mqtt from "mqtt";
// 设置为全局变量 否则vue将要消耗大量性能  因为不需要对游客对象实时监听
// 当mqtt客户端接收到消息后，直接取值赋值给labelmaker创建地图实例
// 1.创建labelmaker 无影响
// 2.更新labelmaker 无影响
// 这是游客对象
var vistors = new Map();
// 这是游客标记
var vistors_model = [];
export default {
  data() {
    return{
      AMap: null,   // AMap 类
      map: null,    // 地图对象
      labelsLayer: null,  // LabelsLayer 图层对象
      // vistors: new Map(),  // 游客Map数据结构，维护景区游客的信息 // 不合理
    } 
  },
  mounted() {
    this.initMap();
    this.initMqtt();
    setInterval(this.update_vistors_model, 360000); // 定时器 6分钟更新一次
  },
  methods:{

    // 获取AMap类
    initMap() {
      AMapLoader.load({
        key:"9909d8d88b176d44601f698bcea8e29a",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version:"2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins:[''],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then((AMap)=>{
        // 直接将AMap保存出来 因为不止创建地图需要她
        this.AMap = AMap;
        console.log("AMap获取成功");
        this.createMap();
        console.log("地图初始化成功");
        this.initLabelLayers();
        console.log("初始化labelLayers成功");
      }).catch(e=>{
        console.error(e);
      })
    },
    // 初始化地图
    createMap() {
      this.map = new this.AMap.Map("container",{  //设置地图容器id
        viewMode:"2D",    //是否为3D地图模式
        zoom:5,           //初始化地图级别
        center:[105.602725,37.076636], //初始化地图中心点位置
      });
    },
    // 初始化labellayers 
    initLabelLayers() {
      this.labelsLayer = new this.AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        // 该层内标注是否避让
        collision: true,
        // 设置 allowCollision：true，可以让标注避让用户的标注
        allowCollision: true,
      });
      // 将图层添加到地图上
      this.map.add(this.labelsLayer);
    },
    // 初始化mqtt客户端
    initMqtt() {
      // 1.连接mqtt服务器
      var client = mqtt.connect("ws://localhost:3010");
      // 2.订阅创建游客标记的主题，处理游客的创建
      client.subscribe("mqtt/create_vistor_model");
      // 3.订阅游客数据上传的主题，处理游客的数据上传
      client.subscribe("mqtt/update_vistor_model");
      // 4.订阅销毁游客标记的主题，处理游客的销毁
      client.subscribe("mqtt/destroy_vistor_model");
      // 5.订阅游客求助的主题，处理游客的求助
      client.subscribe("mqtt/vistor_help");
    
      // 6.等待mqtt服务器回应,根据topic的类型，选择不同的处理方法  优化：策略模式
      client.on("message", this.handle())
    },
    // message处理函数
    handle(topic, payload) {
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
    },
    createVistor(v) {
      var arr = v.split(',');
      // 1.clientId 2.姓名 3.体温 4.充值 5.消费 6.消费产品名称 7.位置 8.位置
      var person = new vistor(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
      // 键：clientId 值：游客对象
      // 调用游客对象的创建游客标记方法，在地图上创建标记  不合理
      // 新建的游客对象添加进游客map
      vistors.set(arr[0], person);
      // 更新游客标记
      this.creat_vistor_model(person);
    },
    creat_vistor_model(p) {
      // 设置图标对象
      var icon = {
        // 图标类型，现阶段只支持 image 类型
        type: 'image',
        // 图片 url
        image: 'https://a.amap.com/jsapi_demos/static/demo-center/marker/express2.png',
        // 图片尺寸
        size: [64, 30],
        // 图片相对 position 的锚点，默认为 bottom-center
        anchor: 'center',
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
      var labelMarker = new this.Amap.LabelMarker({
        name: p.clientId, // 此属性非绘制文字内容，仅最为标识使用
        position: [p.positionLong, p.positionLati],
        zIndex: 16,
        // 将第一步创建的 icon 对象传给 icon 属性
        icon: icon,
        // 将第二步创建的 text 对象传给 text 属性
        text: text,
      })
      this.labelsLayer.add(labelMarker);
      // 加入游客标记数组
      vistors_model.push(labelMarker);
    },
    updateVistor(p) {
      var arr = p.split(',');
      // 根据游客id获取对象
      var person = vistors.get(p.clientId);
      // 体温需要更新 
      person.bodyTem = arr[2];
      // 充值金额需要更新
      person.deposit = arr[3];
      // 消费金额需要更新
      person.consume = arr[4];
      // 消费产品需要更新
      person.goodsName = arr[5];
      // 经度需要更新
      person.positionLong = arr[6];
      // 纬度需要更新
      person.positionLati = arr[7];
    },
    // 监控平台6分钟更新一次
    update_vistors_model() {
      // 1.先清空地图的游客标记
      vistors_model.length = 0;
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
      for (var [clientId, p] of vistors) {
        text.content = p.name + ' ' + p.bodyTem + ' ' + p.deposit + ' ' + p.consume + ' ' + p.goodsName; 
        var labelMarker = new this.Amap.LabelMarker({
          name: clientId, // 此属性非绘制文字内容，仅最为标识使用
          position: [p.positionLong, p.positionLati],
          zIndex: 16,
          // 将第一步创建的 icon 对象传给 icon 属性
          icon: icon,
          // 将第二步创建的 text 对象传给 text 属性
          text: text,
        })
        vistors_model.push(labelMarker);
      }
      // 添加到labelLayer
      this.labelsLayer.add(vistors_model);
    },
    // 销毁游客实例，1.从vistors map对象删除  2.从vistors_model数组移除  3.从labelLayer移除
    destroyVistor(p) {
      // 1.
      vistors.delete(p.clientId);
      // 2.
      var index;
      var marker;
      for(var i = 0; i < vistors_model.length; i++) {
        if(vistors_model[i].clientId == p.clientId) {
          marker = vistors_model[i];
          index = i;
          break;
        }
      }
      if(index == vistors_model.length) {
        alert("该游客不存在");
      }
      else {
        vistors_model = vistors_model.slice(0, index).concat(vistors_model.slice(index+1, vistors_model.length))
      }
      // 3.
      this.labelsLayer.remove(marker);
    }
  },
}
</script>

<style  scoped>
  #container{
    padding:0px;
    margin: 0px;
    width: 100%;
    height: 800px;
  }
</style>