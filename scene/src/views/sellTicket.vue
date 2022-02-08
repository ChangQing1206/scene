<template>
<div id="container">
  <head-top></head-top>
</div>
</template>

<script>

import headTop from '@/components/headTop'
import AMapLoader from '@amap/amap-jsapi-loader';
var amap = null;
var map = null;
var labelsLayer = null;
var vistors_model = [];
export default {
  components: {
    headTop
  },
  mounted() {
    this.initMap();
    // setInterval(this.create, 10000);
    
    setTimeout(this.update, 10000);
  },
  methods: {
    // 获取AMap类
    initMap() {
      AMapLoader.load({
        key:"9909d8d88b176d44601f698bcea8e29a",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version:"2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins:[''],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then((AMap)=>{
        // 直接将AMap保存出来 因为不止创建地图需要她
        amap = AMap;
        this.createMap();
        this.initLabelLayers();
        this.create();
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
        labelsLayer = new amap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        // 该层内标注是否避让
        collision: true,
        // 设置 allowCollision：true，可以让标注避让用户的标注
        allowCollision: true,
      });

      // 将图层添加到地图上
      map.add(labelsLayer);
    },
    create() {
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
      text.content = '电脑上看尽快';
      var longtitude = Number((Math.random()/100 + 113.08).toFixed(6))
      var latitude = Number((Math.random()/100*2 + 22.58).toFixed(6));
      var labelMarker = new amap.LabelMarker({
        name: '1', // 此属性非绘制文字内容，仅最为标识使用
        position: [longtitude, latitude],
        zIndex: 16,
        // 将第一步创建的 icon 对象传给 icon 属性
        icon: icon,
        // 将第二步创建的 text 对象传给 text 属性
        text: text,
      })
      // vistors_model.push(labelMarker);

      labelsLayer.add(labelMarker);
      console.log("labelMarkder")
      // console.log(labelsLayer.getAllOverlays('marker'));

    },
    update() {

      console.log(labelsLayer.getAllOverlays('marker'))
    }

  }
}
</script>

<style scoped>

</style>
