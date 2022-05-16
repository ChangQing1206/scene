<template>
  
  <div>
    <h4>添加商品</h4>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="商店注册码">
        <el-tooltip  class="item" effect="dark" content="商家注册码必须填写无误，否则添加商品将会失败" placement="top">
          <el-input v-model="form.registerCode"></el-input>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="商品名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="商品类别">
        <el-select v-model="form.region" placeholder="请选择商品类别">
          <el-option label="饮料" value="drink"></el-option>
          <el-option label="零食" value="snack"></el-option>
          <el-option label="纪念品" value="memory"></el-option>
          <el-option label="热食" value="hotFood"></el-option>
          <el-option label="水果" value="fruit"></el-option>
          <el-option label="住宿" value="home"></el-option>
          <el-option label="特别服务" value="special_service"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="入库时间">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
        </el-col>
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
  
</template>
<script>
  export default {
    data() {
      return {
        form: {
          registerCode: '',
          name: '',
          type: '',
          date1: '',
          date2: '',
          isSell: false,
          number: 0,
          price: '',
          desc: ''
        }
      }
    },
    methods: {
      onSubmit() {
        console.log('submit!');
      }
    }
  }
</script>

<style scoped>

</style>