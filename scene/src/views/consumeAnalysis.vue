<template>
  <div class="fillcontain">
    <head-top></head-top>
    <!-- 
      饼图展示
      统计游客消费的商品的数量
    -->
    <div class="box">
      <div id="consume1" :style="{width: '800px', height: '800px'}"></div>
      <div id="consume2" :style="{width: '800px', height: '600px'}"></div>
    </div>
  </div>
</template>

<script>
import headTop from "@/components/headTop.vue"
import * as echarts from "echarts"
import {goodsAnalyse} from "@/api/api"

export default {
  data() {
    return {
      analyseData: ''
    }
  },
  components: {
    headTop
  },
  created() {
    this.analyseData = this.genData(50);
  },
  mounted() {
    //this.pieChart = echarts.init(document.getElementById('consume'));
    this.drawPie();
    this.drawBar(); 
    // this.consumeAnalysis();
  },
  methods: {
    // 统计各类消费的商品的数量  两种方式  直方图：按商品类别统计  和  饼图：按商品占比统计 
    consumeAnalysis() {
      goodsAnalyse().then(res => {
        if(res.status == 1) {
          // this.analyseData = res.data;
          this.drawPie();
        }
        else {
          this.$message({
            type: 'error',
            message: '分析失败'
          })
        }
      }).catch(err => err)
    },
    // 画图
    drawPie() {
      let pieChart = echarts.init(document.getElementById('consume1'));
      var option = {
        title: {
          text: '按消费各种商品数量统计',
          subtext: '喜好分析',
          left: 'center'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          data: this.analyseData.legendData
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: '姓名',
            type: 'pie',
            radius: '55%',
            center: ['40%', '50%'],
            data: this.analyseData.seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      pieChart.setOption(option);
    },
    drawBar() {
      let barChart = echarts.init(document.getElementById('consume2'));
      var option = {
        title: {
          text: '按消费商品的类别统计',
          subtext: '喜好分析',
          left: 'center'
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            }
          }
        ]
      };
      barChart.setOption(option)
    },
  genData(count) {
  // prettier-ignore
  const nameList = [
        '赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤', '许', '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏', '陶', '姜', '戚', '谢', '邹', '喻', '柏', '水', '窦', '章', '云', '苏', '潘', '葛', '奚', '范', '彭', '郎', '鲁', '韦', '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳', '酆', '鲍', '史', '唐', '费', '廉', '岑', '薛', '雷', '贺', '倪', '汤', '滕', '殷', '罗', '毕', '郝', '邬', '安', '常', '乐', '于', '时', '傅', '皮', '卞', '齐', '康', '伍', '余', '元', '卜', '顾', '孟', '平', '黄', '和', '穆', '萧', '尹', '姚', '邵', '湛', '汪', '祁', '毛', '禹', '狄', '米', '贝', '明', '臧', '计', '伏', '成', '戴', '谈', '宋', '茅', '庞', '熊', '纪', '舒', '屈', '项', '祝', '董', '梁', '杜', '阮', '蓝', '闵', '席', '季', '麻', '强', '贾', '路', '娄', '危'
    ];
  const legendData = [];
  const seriesData = [];
  for (var i = 0; i < count; i++) {
    var name =
      Math.random() > 0.65
        ? makeWord(4, 1) + '·' + makeWord(3, 0)
        : makeWord(2, 1);
    legendData.push(name);
    seriesData.push({
      name: name,
      value: Math.round(Math.random() * 100000)
    });
  }
  return {
    legendData: legendData,
    seriesData: seriesData
  };
  function makeWord(max, min) {
    const nameLen = Math.ceil(Math.random() * max + min);
    const name = [];
    for (var i = 0; i < nameLen; i++) {
      name.push(nameList[Math.round(Math.random() * nameList.length - 1)]);
    }
    return name.join('');
  }
}
  }
}
</script>

<style scoped lang="less">
  @import '@/assets/css/mixin';
  .box {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
</style>
