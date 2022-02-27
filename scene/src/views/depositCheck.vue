<template>
  <div class="fillcontain">
    <head-top></head-top>
    <el-row :gutter="20" class="tag">
      <!-- 默认是正常显示 -->
      <el-col :span="4"><el-button size="small" type="primary" @click="normalShow">正常显示</el-button><el-button size="small" type="primary" @click="vistorShow">游客显示</el-button></el-col>
      
      <el-col :span="2" :offset="18">
        <el-tooltip class="item" effect="dark" content="refresh data" placement="top-start">
          <el-button type="primary" icon="el-icon-refresh" @click="refresh" circle></el-button>
        </el-tooltip>
      </el-col>
    </el-row>
    <el-table :data="tableData" :default-sort = "{prop: 'date', order: 'descending'}">
      <el-table-column label="游客ID" prop="_id">

      </el-table-column>
      <el-table-column label="游客姓名" prop="name">
        
      </el-table-column>
      <el-table-column label="充值金额" prop="deposit">

      </el-table-column>
      <el-table-column label="充值状态" prop="status">

      </el-table-column>
      <el-table-column sortable label="充值时间" prop="dateTime">

      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="Pagination">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="12"
        layout="total, prev, pager, next"
        :total="count">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import headTop from '@/components/headTop'
import {getDeposits, getClientDeposits, getDepositsCount } from '@/api/api'
export default {
  data() {
    return {
      tableData: [],
      limit: 12,
      offset: 0,
      count: 0,
      currentPage: 1,
      mode: 'normal'
    }
  },
  mounted() {
    this.getDepositsCount();
    this.getDeposits(); 
  },
  components: {
    headTop
  },
  methods: {
  // 1.按顺序显示
    getDeposits() {
      getDeposits({offset: this.offset, limit: this.limit}).then(res => {
        if(res.status == 1) {
          const data = res.data; // 是一个数组对象
          this.tableData.length = 0; 
          data.forEach((item, index) => {
            this.tableData.push(item);
          })
        }
        else {
          console.log("请求数据失败");
        }
      }).catch(err => err)
    },
  // 2.按游客显示
    getClientDeposits() {
      getClientDeposits({offset: this.offset, limit: this.limit}).then(res => {
        if(res.status == 1) {
          this.count = res.count; // 聚合直接返回数组长度
          const data = res.data;
          this.tableData.length = 0;
          data.forEach((item, index) => {
            this.tableData.push(item);
          })
        }
        else {
          console.log("请求数据失败");
        }
      }).catch(err => err)
    },
  // 3.获取顺序显示时的消费数量
    getDepositsCount() {
      getDepositsCount().then(res => {
        if(res.status == 1) {
          this.count = res.count;
        }
      }).catch(err => err)
    },
    // 5.标签事件处理
    normalShow() {
      this.mode = "normal";
      this.getDepositsCount();
      this.getDeposits();
    },
    // 6.标签点击事件
    vistorShow() {
      this.mode = "client";
      // this.getVistorsCount();
      this.getClientDeposits();
    },
    // 7.分页处理
    handleCurrentChange(val) {
      this.currentPage = val;
      this.offset = (val - 1) * this.limit;
      if(this.mode == 'normal') this.getDeposits();
      else if(this.mode == 'client') this.getClientDeposits();


      // bug: 分页 count skip limit

    },
    handleSizeChange() {

    },
    // 刷新数据
    refresh() {
      if(this.mode == "normal") {
        this.getDepositsCount();
        this.getDeposits();
      }
      else if(this.mode == "client") {
        this.getClientDeposits();
      }
    }
  }
}
</script>


<style lang="less" scoped>
  @import "@/assets/css/mixin";
  .tag {
    margin: 20px 0 10px 0;
  }
</style>