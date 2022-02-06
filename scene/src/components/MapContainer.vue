<template>
    <div id="container"></div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import vistor from '@/utils/vistor';
import * as mqtt from "mqtt";
export default {
  data() {
    return{
      // 不合理
      AMap: null,   // AMap 类
      map: null,    // 地图对象
      labelsLayer: null,  // LabelsLayer 图层对象
      vistors: new Map(),  // 游客Map数据结构，维护景区游客的信息
    } 
  },
  mounted() {
    this.Init();
  },
  methods:{
    Init() {
      // 获取AMap类
      this.getAMap();
      // 初始化地图
      this.initMap();
      // 初始化LabelLayers图层
      this.initLabelLayers();
      // mqtt客户端初始化
      this.initMqtt();
    },
    // 获取AMap类
    getAMap() {
      AMapLoader.load({
        key:"",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version:"2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins:[''],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then((AMap)=>{
        // 直接将AMap保存出来 因为不止创建地图需要她
        this.AMap = AMap;
      }).catch(e=>{
        console.error(e);
      })
    },
    // 初始化地图
    initMap() {
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
      client.on("message", function(topic, payload) {
        // console.log([topic,payload].join(": "));
        // client.end();
        switch(topic) {
          case "create_vistor_model":
            this.createVistor(payload);
            break;
          case "update_vistor_model":
            this.updateVistor(payload);
            break;
          case "destroy_vistor_model":
            this.destroyVistor(payload);
            break;
          case "vistor_help":
            this.helpVistor(payload);
            break;
          default:
            alert("主题错误,没有该主题");
            break;
        }
    });
    },
    createVistor(v) {
      var arr = v.split(',');
      // 1.clientId 2.姓名 3.体温 4.充值 5.消费 6.消费产品名称 7.位置 8.位置
      var person = new vistor(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
      // 键：clientId 值：游客对象
      // 调用游客对象的创建游客标记方法，在地图上创建标记  不合理
      
      // 新建的游客对象添加进游客map
      this.vistors.set(arr[0], person);
    },
    updateVistor(v) {
      var arr = v.split(',');
      var person = this.vistors.get(arr[0]);
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