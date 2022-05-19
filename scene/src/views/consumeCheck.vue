<template>
  <div class="fillcontain">
    <!-- 交易记录：充值 和 消费
      正常显示时，显示消费的信息 比如消费商品应该是单个商品
      游客显示时，比如消费商品应该是个数组， 消费金额也是个数组，消费时间也是个数组
      所以只需要将tableData的内容替换
    -->
    <!-- 消费记录 提供两种查询方法 按消费顺序查询  按游客查询-->
    <head-top></head-top>
    <el-row>
      <!-- 默认是正常显示 -->
      <el-tag click="normalShow">正常显示</el-tag>
      <el-tag click="vistorShow">游客显示</el-tag>
    </el-row>
    <el-table  :data="tableData"  :default-sort = "{prop: 'date', order: 'descending'}">
      <el-table-column label="订单编号" prop="orderNum">
        
      </el-table-column>
      <el-table-column label="游客姓名" prop="name">
        
      </el-table-column>
      <el-table-column label="游客手机号" prop="identity">

      </el-table-column>
      <el-table-column label="商品名称" prop="foodName">
        
      </el-table-column>
      <el-table-column label="消费金额" prop="consume">

      </el-table-column>
      <el-table-column label="支付状态" prop="status">

      </el-table-column>
      <el-table-column sortable label="消费时间" prop="dateTime">

      </el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="danger"
            @click="delConsume(scope.$index, scope.row)">
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
        :page-size="12"
        layout="total, prev, pager, next"
        :total="count">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import headTop from '@/components/headTop'
import {getOrders, getClientOrders, delConsume} from '@/api/api'
export default {
  data() {
    return {
      tableData: [],
      limit: 12,
      offset: 0,
      count: 0,
      currentPage: 1,
      mode: 'normal',
      goods: []
    }
  },
  created() {
    // this.getOrdersCount();
    this.getOrders(); 
  },
  components: {
    headTop
  },
  methods: {

  // 1.按顺序显示
    getOrders() {
      getOrders({offset: this.offset, limit: this.limit}).then(res => {
        if(res.status == 1) {
          this.tableData.length = 0; 
          // console.log(res.message[1].goods)
          var data = res.message
          this.tableData = res.message;
          var g = []
          for(var i = 0; i < data.length; i++) {
            var o = data[i].goods; // 取到goods
            for(var j = 0; j < o.length; j++) {
              g.push(o[j].foodName)
            }
            this.tableData[i].foodName = g.slice(0);  // 引用类型
            g.length = 0;
          }
          this.count = res.count;
        }
        else {
          this.$message({
            type: "error",
            message: "请求数据失败"
          })
        }
      }).catch(err => err)
    },
  // 2.按游客显示
    getClientOrders() {
      getClientOrders({offset: this.offset, limit: this.limit}).then(res => {
        if(res.status == 1) {
          this.tableData.length = 0;
          this.tableData = res.message;
          
        }
        else {
          this.$message({
            type: "error",
            message: "请求数据失败"
          })
        }
      }).catch(err => err)
    },

    delConsume(index, row) {
      delConsume({orderNum: row.orderNum}).then(res => {
        if(res.status) {
          this.$message({
            type: "success",
            message: res.message
          })
        }
      })
    },

    // 5.标签事件处理
    normalShow() {
      this.getOrdersCount();
      this.getOrders();
    },
    // 6.标签点击事件
    vistorShow() {
      this.getVistorsCount();
      this.getClientOrders();
    },
    // 7.分页处理
    handleCurrentChange(val) {
      this.currentPage = val;
      this.offset = (val - 1) * this.limit;
      this.getOrders();
    },
        handleSizeChange() {

    },
  }
}
</script>


<style lang="less" scoped>
  @import "@/assets/css/mixin";
</style>