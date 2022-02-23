<template>
<!-- 知识点:展开行 + 分页 -->
  <div class="fillcontain">
    <head-top></head-top>
    <!-- 表格 -->
    <!-- 思路：不要编辑功能， 在展开行直接显示 体温变化图 消费记录 消费商品 去过的景点 -->
    <div class="table_container">
      <!-- row-key属性的值可以是个函数  -->
      <!-- 按照date降序排序 -->
      <!-- expendRow: 展开行的数组，用于存储展开的行的数据 -->
      <!-- expand-change 参数1:row 参数2:已经展开的row -->
      <el-table
        :data="tableData"
        :default-sort = "{prop: 'date', order: 'descending'}"
        @expand='expand'
        :expand-row-keys='expendRow'
        :row-key="row => row.index"
        style="width: 100%">
        <el-table-column type="expand">
          <!-- slot-scope: 自定义列内容 参数是一个对象 {row, column, $index} -->
          <!-- props: 是这个列绑定的数据 -->
          <template slot-scope="props">
            <!-- 体温变化图表显示区域 -->
            <div ref="echarts" style="width: 600px; height:400px;"></div>
            <!-- 轨迹回放 https://lbs.amap.com/demo/jsapi-v2/example/marker/replaying-historical-running-data -->

          </template>
        </el-table-column>
        <el-table-column
          label="日期"
          prop="date">  
          <!-- prop="date" 这个数据来源是 tableData.date  -->
          <!-- <i class="el-icon-date"></i> -->
        </el-table-column>
        <el-table-column
          label="游客姓名"
          prop="name">
        </el-table-column>
        <el-table-column
          label="游客身份证"
          prop="identity">
        </el-table-column>
        <el-table-column
          label="当前最高体温"
          prop="bodyTemMax">
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="Pagination">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="20"
          layout="total, prev, pager, next"
          :total="count">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import headTop from '../components/headTop'
  import * as echarts from 'echarts'
  import {getVistors, getVistorsCount, deleteVistor} from '@/api/api'
  export default {
    data(){
      return {
        bodyTemChart: null,        // 体温变化图表
        offset: 0,                 // 分页数据偏移量
        limit: 20,                 // 分页数据大小 20条一页
        count: 0,                  // 游客总数量
        tableData: [],             // 游客数据
        currentPage: 1,            // 当前分页
        expendRow: [],
      }
    },
    created(){
      this.$nextTick(function () {
        this.bodyTemChart = echarts.init(this.$ref.echarts);
      })
      this.initData();
    },
    computed: {

    },
    components: {
      headTop,
    },
    methods: {
      initData(){
        // 获取游客总数量
        getVistorsCount().then(res => {
          if(res.status == 1) {
            this.count = res.count;
            // 获取游客数据
            console.log("SSS")
            this.getVistors();
          }
        }).catch(err => {
          console.log(err);
          alert('获取游客数量失败')
        })
      },
      getVistors(){
        // getVistors 带参数查询 偏移量 
        // 这样在后端使用聚合查询时，需要：要么为某字段建立索引 要么直接将_id字段使用顺序数字
        // 如果要保留根据姓名查询记录，则可以采取第一种方法
        getVistors({offset: this.offset, limit: this.limit}).then(res => {
          if(res.status == 1) {
            this.tableData = [];
            const Vistor = res.data;
            console.log(Vistor);
            Vistor.forEach((vistor, index) => {
              const tableData = {};
              // 截取日期
              tableData.name = vistor.name;  // 游客姓名
              tableData.bodyTemMax = vistor.bodyTemMax; // 最大值聚合
              tableData.bodyTem = vistor.bodyTem;   // 用于展示体温变化
              tableData.time = vistor.date_time; // 保存时间数组
              tableData.date = tableData.time[0].slice(0,10);   // 这里是一个时间数组 YYYY-MM-DD HH:mm
    
              tableData.identity = vistor._id; // 身份证
              tableData.position = vistor.position; // 用于轨迹回放
              tableData.index = index; // 这个是索引
              this.tableData.push(tableData);
            })
          }
        }).catch(err => {
          console.log(err);
          alert("获取游客数据失败");
        })
      },
      // 分页数据变化时触发
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      // 当前分页变化时会触发
      handleCurrentChange(val) {
        // 获取当前分页
        this.currentPage = val;
        // 显示数据的偏移 val = 1时，显示前20条数据 val = 2时，显示第21条到40条数据 偏移20
        this.offset = (val - 1) * this.limit;
        // 获取第val页的数据
        this.getVistors();
      },
      // 展开行触发的操作 
      expand(row, status){
        if(status) {
          // 生成体温变化图 
          var time;
          for(var i = 0; i < row.time.length; i++) {
            time.push(row.time[i].slice(11, 16));
          }
          this.generateBodyTem(row.bodyTem, time);
          this.$nextTick(() => {
            this.expendRow.push(row.index);
          })
        }else{
          const index = this.expendRow.indexOf(row.index);
          this.expendRow.splice(index, 1)
        }
      },
      // 生成体温数据变化图
      generateBodyTem(v_bodyTem, v_time) {
        // 使用echarts 以时间为横坐标 温度为纵坐标
        var option = {
          xAxis: {
            type: 'time',
            name: '游玩时间',
            data: v_time
          },
          yAxis: {
            type: 'value',
            name: '体温'
          },
          series: [
            {
              data: v_bodyTem,
              type: 'line',
              smooth: true
            }
          ]
        }
        option && this.bodyTemChart.setOption(option);
      },
      // 删除游客
      handleDelete(index, row) {
        // 根据游客id删除游客
        deleteVistor({clientId: row.identity}).then(res => {
          if(res.status == 1) {
            this.$message({
              type: 'success',
              message: '删除游客信息成功'
            })
            // 删除对应的tableData
            this.tableData.splice(index, 1);
          }
          else {
            this.$message({
              type: 'error',
              message: '删除游客信息失败'
            })
          }
        }).catch(err => {
          console.log(err);
        })
      }
    },
  }
</script>

<style lang="less" scoped>
	@import '@/assets/css/mixin';
    .demo-table-expand {
      font-size: 0;
    }
    .demo-table-expand label {
      width: 90px;
      color: #99a9bf;
    }
    .demo-table-expand .el-form-item {
      margin-right: 0;
      margin-bottom: 0;
      width: 50%;
    }
    .table_container{
      padding: 20px;
    }
    .Pagination{
      display: flex;
      justify-content: flex-start;
      margin-top: 8px;
    }
    .avatar-uploader .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .avatar-uploader .el-upload:hover {
      border-color: #20a0ff;
    }
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 120px;
      height: 120px;
      line-height: 120px;
      text-align: center;
    }
    .avatar {
      width: 120px;
      height: 120px;
      display: block;
    }
</style>
