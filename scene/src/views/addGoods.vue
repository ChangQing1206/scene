<template>
  
  <div>
    <head-top></head-top>
    <el-radio-group @change="switchEvent" v-model="radio" size="small">
      <el-radio label="1" border>添加商品</el-radio>
      <el-radio label="2" border>编辑商品</el-radio>
    </el-radio-group>
    <div class="addGoods_area" v-show="radio === '1'">
    <h4 class="title">添加商品</h4>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="注册码">
        <el-tooltip  class="item" effect="dark" content="商家注册码必须填写无误，否则添加商品将会失败" placement="top">
          <el-input v-model="form.regCode"></el-input>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="商品名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="商品类别">
        <el-select v-model="form.type" placeholder="请选择商品类别">
          <el-option label="饮料" value="drink"></el-option>
          <el-option label="零食" value="snack"></el-option>
          <el-option label="纪念品" value="memory"></el-option>
          <el-option label="热食" value="hotFood"></el-option>
          <el-option label="水果" value="fruit"></el-option>
          <el-option label="住宿" value="home"></el-option>
          <el-option label="特别服务" value="special_service"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="出售状态">
        <el-switch v-model="form.isSell"></el-switch>
      </el-form-item>
      <el-form-item label="商品单价">
        <el-input v-model="form.price"></el-input>
      </el-form-item>
      <el-form-item label="商品库存">
        <el-input v-model="form.number"></el-input>
      </el-form-item>
      <el-form-item label="商品描述">
        <el-input type="textarea" v-model="form.desc"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即添加</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
    </div>

    <div class="edit_area" v-show="radio === '2'">
      <el-table :data="tableData" :default-sort = "{prop: 'date', order: 'descending'}">
        <el-table-column label="商品名称" prop="goodsName">

        </el-table-column>
        <el-table-column label="商品类别" prop="goodsType">
          
        </el-table-column>
        <el-table-column label="出售状态" prop='isSell'>

        </el-table-column>
        <el-table-column label="商家单价" prop="price">

        </el-table-column>
        <el-table-column label="商家库存" prop="number">

        </el-table-column>
        <el-table-column label="商家描述" prop="desc">

        </el-table-column>
        <el-table-column sortable label="添加时间" prop="create_time">

        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="danger"
              @click="delGoods(scope.$index, scope.row)">
              删除
            </el-button>
            <el-button type="primary" size="small">编辑</el-button>
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

  </div>
  
</template>
<script>
  import headTop from '@/components/headTop'
  import { addGoods, editGoods, delGoods, updateGoods } from '@/api/api'
  export default {
    data() {
      return {
        form: {
          regCode: '',
          name: '',
          type: '',
          isSell: false,
          number: 0,
          price: '',
          desc: '',
          
        },
        radio: '1',
        tableData: [],
        limit: 12,
        offset: 0,
        count: 0,
        currentPage: 1,
        mode: 'normal'
      }
    },
    mounted() {
      
    },
    methods: {
      switchEvent() {
        if(this.radio == 2) {
          this.editGoods();
        }
      },
      onSubmit() {
        this.addGoods(this.form);
      },
      addGoods(good) {
        if(good.isSell == true) {
          good.isSell = "出售中"
        }else {
          good.isSell = "未出售"
        }
        addGoods(good).then(res => {
          if(res.status == 1) {
            this.$message({
              type: "success",
              message: '添加商品成功'
            })
          }
        })
      },
      editGoods() {
        editGoods({offset: this.offset, limit: this.limit}).then(res => {
          if(res.status == 1) {
            this.tableData = res.message
            this.count = this.tableData.length
          }
        })
      },
      delGoods(index, row) {
        delGoods({goodsName: row.goodsName}).then(res => {
          if(res.status == 1) {
            this.$message({
              type: "success",
              message: res.message
            })
            this.editGoods();
          }else {
            this.$message({
              type: "error",
              message: res.message
            })
            this.editGoods();
          }
        })
      },
      updateGoods() {
        updateGoods().then(res => {
          if(res.status == 1) {
            this.$message({
              type: "success",
              message: res.message
            })
          }else {
            this.$message({
              type: "error",
              message: res.message
            })
          }
        })
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
    },
    components: {
      headTop
    }
  }
</script>

<style lang="less" scoped>
  @import '@/assets/css/mixin';
  .addGoods_area {
    width: 40%;
    height: 50%;
    margin: 0 auto;
    margin-top: 100px;
  }
  .title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 50px;
  }
</style>