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
        @expand-change='expand'
        :row-key="row => row.index"
        highlight-current-row
        style="width: 100%">
        <el-table-column type="expand">
          <!-- slot-scope: 自定义列内容 参数是一个对象 {row, column, $index} -->
          <!-- props: 是这个列绑定的数据 -->
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="游客ID">
                <span>{{ props.row.clientId }}</span>
              </el-form-item>
              <el-form-item label="日期">
                <span>{{ props.row.date }}</span>
              </el-form-item>
              <el-form-item label="游客姓名">
                <span>{{ props.row.name }}</span>
              </el-form-item>
              <el-form-item label="游客最高体温记录">
                <span>{{ props.row.bodyTemMax }}</span>
              </el-form-item>
              <el-form-item label="游客充值记录">
                <span>{{ props.row.deposit }}</span>
              </el-form-item>
              <el-form-item label="游客消费记录">
                <span>{{ props.row.consume }}</span>
              </el-form-item>
              <el-form-item label="游客消费商品记录">
                <span>{{ props.row.goodsName }}</span>
              </el-form-item>
              <el-form-item label="游客去过的景点">
                <span>{{ props.row.scenePoint }}</span>
              </el-form-item>
            </el-form>
            <!-- 体温变化图表显示区域 -->
            <div id="echart" style="width: 600px; height:400px;"></div>
          </template>
        </el-table-column>
        <el-table-column
          label="日期"
          sortable
          prop="date">  
          <!-- prop="date" 这个数据来源是 tableData.date  -->
          <i class="el-icon-date"></i>
        </el-table-column>
        <el-table-column
          label="游客ID"
          prop="clientId">
        </el-table-column>
        <el-table-column
          label="游客姓名"
          prop="name">
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
  import echarts from 'echarts'
  import {getVistors, getVistorsCount, deleteVistor} from '@/api/getData'
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
      this.bodyTemChart = echarts.init(document.getElementById("echart"));
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
            Vistor.forEach((vistor, index) => {
              const tableData = {};
              // 截取日期
              tableData.date = vistor.date[0].slice(0, 10);   // 这里是一个时间数组 YYYY-MM-DD HH:mm
              tableData.clientId = vistor.clientId;
              tableData.name = vistor.name;
              tableData.bodyTemMax = vistor.bodyTemMax; // 最大值聚合
              tableData.deposit = vistor.deposit; // 去重聚合
              tableData.consume = vistor.consume; // 去重聚合
              tableData.bodyTem = vistor.bodyTem;   // 用于展示体温变化
              tableData.position = vistor.position; // 用于计算游客去过的景点
              tableData.goodsName = vistor.goodsName; 
              tableData.time = vistor.date; // 保存时间数组
              tableData.scenePoint = vistor.scenePoint; // 游客去过的景点
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
      expand(row, expandedRows){
        if(expandedRows.includes(row)) {
          // 移除该展开行数据
          const index = this.expendRow.indexOf(row.index);
          this.expendRow.splice(index, 1);
        }
        else {
          // 生成体温变化图 
          var time;
          for(var i = 0; i < row.time.length; i++) {
            time.push(row.time[i].slice(11, 16));
          }
          this.generateBodyTem(row.bodyTem, time);
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
        deleteVistor(row.clientId).then(res => {
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

<style lang="less">
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
