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
      analyseData: {foodName: [], food_price: []},
      num: []
    }
  },
  components: {
    headTop
  },
  created() {
    this.consumeAnalysis();
  },
  mounted() {
    
  },
  methods: {
    // 统计各类消费的商品的数量  两种方式  直方图：按商品类别统计  和  饼图：按商品占比统计 
    consumeAnalysis() {
      goodsAnalyse().then(res => {
        if(res.status == 1) {
          this.analyseData = res.message;
          console.log(res.message)
          console.log(Object.keys(this.analyseData.food_type))
          console.log(this.analyseData);
          for(var key in this.analyseData.food_type) {
            this.num.push(this.analyseData.food_type[key])
          }
          this.drawPie();
          this.drawBar(); 
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
          data: this.analyseData.foodName
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
            data: this.analyseData.food_price,
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
          tooltip: {
          tooltip: {
            trigger: 'axis'
          },
          },
        title: {
          text: '按消费商品的类别统计',
          subtext: '喜好分析',
          left: 'center'
        },
        xAxis: {
          type: 'category',
          data: Object.keys(this.analyseData.food_type)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.num,
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            },
            tooltip: {
              valueFormatter: value => value
            },
          },

        ]
      };
      barChart.setOption(option)
    },
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
