<template>
  <div class="fillcontain">
    <head-top></head-top>
    <el-row>
      <!-- 按天查询 -->
      <el-select v-model="queryDate" placeholder="请选择日期">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">>

        </el-option>
      </el-select>
    </el-row>
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
        :page-size="20"
        layout="total, prev, pager, next"
        :total="count">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import headTop from '@/components/headTop'
import { getTickets } from '@/api/api';
export default {
  data() {
    return {
      tableData: [],
      limit: 20,
      offset: 0
    }
  },
  components: {
    headTop
  },
  methods: {
    // 分页处理
    handleCurrentChange(val) {
      this.offset = (val - 1) * this.limit;
    },
    // 请求门票数据
    getTickets() {
      getTickets({offset: this.offset, limit: this.limit}).then(res => {
        if(res.status == '1') {
          this.tableData = res.data;
        }
        else {
          this.$message({
            type: 'error',
            message: '请求失败'
          })
        }
      }).catch(err => err);
    }
  },
  computed: {
    options: function() {
      var ops = [];
      var date = new Date();
      for(var i = 1; i < 4; i++) {
        var temp = date.toISOString();
        temp = temp.slice(0,10)
        ops.push({temp: temp});
        date = date.setDate(date-i);
      }
      return ops;
    }
  }
}
</script>

<style lang="less" scoped>
  @import "@/assets/css/common";

</style>