<template>
  <div class="fillcontain">
    <head-top></head-top>
    <!-- 
      饼图展示
      统计游客消费的商品的数量
    -->
    <div id="consume">

    </div>
  </div>
</template>

<script>
import headTop from "@/components/headTop.vue"
import echarts from "echarts"
import {goodsAnalyse} from "@/api/api"
export default {
  data() {
    return {
      pieChart: null,
      analyseData: []
    }
  },
  components: {
    headTop
  },
  create() {
    this.pieChart = echarts.init(document.getElementById('consume'));
    this.consumeAnalysis();
  },
  methods: {
    // 统计各类消费的商品的数量
    consumeAnalysis() {
      goodsAnalyse().then(res => {
        if(res.status == 1) {
          this.analyseData = res.data;
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
      var option = {
        legend: {
          top: 'bottom'
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
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [50, 250],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 8
            },
            data: this.analyseData   // 数据 [{value: , name:}, {}, {}]
            // 所以在返回时，必须要value name这两个字段
          }
        ]
      };
      this.pieChart.setOption(option);
    }
  }
}
</script>

<style scoped lang="less">
  @import '@/assets/css/mixin';

</style>
