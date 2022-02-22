<template>
  <div class="fillcontain">
    <head-top></head-top>
    <div class="right">
      <!-- 按天查询 -->
      <el-tooltip class="item" effect="dark" content="按照输入日期查询门票信息" placement="top-start">
        <el-button>日期查询</el-button>
      </el-tooltip>
      <el-select @change="getDate" size="small" v-model="queryDate" placeholder="请选择日期">
        <el-option :label="all" :value="all"></el-option>
        <el-option :label="date.today" :value="date.today"></el-option>
        <el-option :label="date.yesterday" :value="date.yesterday"></el-option>
        <el-option :label="date.day_before_yes" :value="date.day_before_yes"></el-option>
      </el-select>
    </div>
    <el-table :data="tableData" :default-sort = "{prop: 'date', order: 'descending'}">
      <el-table-column label="游客身份证" prop="identity">

      </el-table-column>
      <el-table-column label="游客姓名" prop="name">
        
      </el-table-column>
      <el-table-column label="门票状态" prop="status">

      </el-table-column>
      <el-table-column label="出票时间" prop="create_time">

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
import { getTickets, getTicketsCount } from '@/api/api';
export default {
  data() {
    return {
      tableData: [],
      limit: 12,
      offset: 0,
      queryDate: '',
      currentPage: 1,
      count: 0,
      all: '所有'
    }
  },
  create() {

  },
  mounted() {
    // 获取门票数量
    this.getTicketsCount();
    this.getTickets();
  },
  components: {
    headTop
  },
  methods: {
    // 选中值触发
    getDate(val) {
      if(val == "所有") {
        this.queryDate = '';
        this.getTicketsCount();
        this.getTickets();
      }
      else {
        this.queryDate = val;
        this.getTickets();
      }
    },
    // 获取门票数
    getTicketsCount() {
      getTicketsCount().then(res => {
        if(res.status == '1') {
          this.count = res.count;
        }else {
          this.$message({
            type:'error',
            message: '请求失败'
          })
        }
      }).catch(err => err)
    },
    // 请求门票数据
    getTickets() {
      getTickets({offset: this.offset, limit: this.limit, queryDate: this.queryDate}).then(res => {
        if(res.status == '1') {
          // 如果返回的数据有count 说明是按日期请求
          if(res.count) {
            this.count = res.count;
          }
          var data = res.data;
          this.tableData = [];
          data.forEach((item, index) => {
            var t = {};
            t.identity = item._id;
            t.name = item.name;
            t.status = item.status;
            t.create_time = item.create_time;
            this.tableData.push(t);
          })
        }
        else {
          this.$message({
            type: 'error',
            message: '请求失败'
          })
        }
      }).catch(err => err);
    },
    // 当前分页变化时会触发
    handleCurrentChange(val) {
      // 获取当前分页
      this.currentPage = val;
      // 显示数据的偏移 val = 1时，显示前20条数据 val = 2时，显示第21条到40条数据 偏移20
      this.offset = (val - 1) * this.limit;
      // 获取第val页的数据
      this.getTickets();
    },
    handleSizeChange() {

    }
  },
  computed: {
    date: function() {
      var d = new Date();
      var today = d.toISOString().slice(0,10);
      d.setDate(d.getDate() - 1);
      var yesterday = d.toISOString().slice(0,10);
      d.setDate(d.getDate() - 1);
      var day_before_yes = d.toISOString().slice(0,10);
      return {today, yesterday, day_before_yes};
    }
  }
}
</script>

<style lang="less" scoped>
  @import "@/assets/css/common";
  .right {
    margin: 10px, 20px, 10px, 0px;
    .item {
      margin-right: 20px;
    }
  }
</style>