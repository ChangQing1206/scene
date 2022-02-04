<template>
  <div>
    <head-top></head-top>
		<section class="section_article">
			<div class="section_title">基于物联网技术的景区管理系统</div>
      <div class="section_content">
        <h3>任务书</h3>
        <br>
        <h4>
          1.电子门票：将RFID技术应用于景区电子门票，实现出票、验票（门禁）、计票等功能。可实现景区“一卡通”功能（选做），游客对电子门票充值后，可以在景区内进行餐饮、旅游项目、购物等一切消费活动。
        </h4>
        <br>
        <h4>
          2.定位跟踪：将GPS/北斗定位技术用于游客的定位跟踪，在游客求助时可以迅速确定游客的位置，及时提供帮助；可以对各景点的客流量进行统计，结合电子地图，对景点拥堵的概率、时段和程度进行预报。
        </h4>
        <br>
        <h4>
          3.电子围栏：结合电子地图，在重点建筑、景区边界等处设置电子围栏，当游客越过电子围栏时会向游客发出提示信息，并向景区工作人员发出报警信息，以保证景区内人身、财产安全性。
        </h4>
        <br>
        <h4>
          4.体温检测：实时监测游客体温，当体温出现异常时，向景区管理处发出报警信息。
        </h4>
        <br>
        <h4>
          5.一键求助：游客遇有紧急情况需要帮助时，可以通过终端节点一键求助按键，向景区管理处进行求助。
        </h4>
        <br>
        <h4>
          6.数据记录与查询：可以记录和查询近几天游客的相关信息，包括游客基本信息、体温、游览景点数据等
        </h4>
        <br>
      </div>
      </section>
  </div>
</template>

<script>
	import headTop from '@/components/headTop'
  export default {
    components: {
      headTop
    },
  }
</script>

<style lang="less">
	@import '@/assets/css/mixin';
  .section_article {
    width: 100%;
    .section_title {
      background-image: linear-gradient(to right, #30cfd0, #330867);
      width: 100%;
      height: 50px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      line-height: 50px;
      color: white;
    }
    .section_content {
      width: 80%;
      margin: 0 auto;
      margin-top: 20px;
    }
  }
</style>
