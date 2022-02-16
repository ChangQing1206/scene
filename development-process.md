# 毕设前端系统开发流程

## 技术栈：Vue.js + ElementUi + Axios + Less + ES6/7 + mqtt.js + 百度地图MapVgl  +  百度地图API 

### 1.项目分析

项目其实可以分为两部分，即是传统的web系统和物联网系统。前端系统包括**监控平台、电子围栏、历史数据查询、喜好分析、登录注册。**

![1643768629308](C:\Users\32705\AppData\Local\Temp\1643768629308.png)

#### **登录注册** 

需要对管理员的信息加密。如果登录过，还将自动登录。

#### 历史数据查询

对游客的姓名、体温、充值金额、消费金额、消费商品名称，位置数据信息进行查询。还可以对游客的轨迹进行回放。

#### 喜好分析

对游客的位置数据分析，统计去过的景点，景点就是一个多边形区域。对游客的消费数据进行分析，分析哪种商品最受欢迎。【商家设备：可考虑将售票系统改成商家管理系统】

#### 监控平台

游客设备使用switch可判断指令类型。指令1：售票系统将门票信息发送给游客设备。指令2：监控平台需要将游客分布情况【拥堵概率、时段和程度】发送至游客设备。指令3：电子围栏报警【进入禁入区域，监控平台发送报警至设备，同时通知管理员】。 指令4：进入景点提醒【游客进入景点，监控平台发送提醒】指令5：游客求助

### 2.创建项目（前提已经安装好node.js(自带npm)，mongodb, vscode, vue-cli )

1. https://www.jianshu.com/p/5d00521f187a    先在github上创建一个仓库，然后要关联一个远程库，使用命令`git remote add origin git@server-name:path/repo-name.git`；orgin: 远程仓库名   code:https://github.com/ChangQing1206/admin-system-fronter.git  git remote add admin-system-fronter git@github.com:ChangQing1206/admin-system-fronter.git    git push -u origin master 推送到远程仓库   但先需提交到本地仓库   git commit -m [项目初始化]     查看分支：`git branch`

   创建分支：`git branch <name>`

   切换分支：`git checkout <name>`或者`git switch <name>`

   创建+切换分支：`git checkout -b <name>`或者`git switch -c <name>`

   合并某分支到当前分支：`git merge <name>`

   删除分支：`git branch -d <name>`

   ```
   echo "# ChangQing1206" >> README.md
   git init
   git add README.md
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/ChangQing1206/ChangQing1206.git
   git push -u origin main
   ```

2. 可以先有本地仓库在关联到远程仓库  也可以从远程仓库克隆，即是先有远程仓库

3. git init : 选择一个目录初始化为git仓库   git add: 提交所有文件到暂存区  git  status: 查看当前仓库状态，显示所有变更文件  git diff: 比较工作区和暂存区的文件差异  git commit: 提交暂存区到本地仓库  git reset: 回退版本 

4. git rm: 删除工作区文件  git  log: 查看提交记录  git fetch: 获取远程代码库  git push: 上传至远程仓库  git pull: 拉取远程仓库  git clone: 拷贝一个项目的副本 

5. 查看npm版本  command: npm -V 

6. 查看node版本 command: node -V

7. 查看vue-cli版本：command: vue -V

8. 创建项目：command: vue create project_name  使用vue2

9. 划分目录，network:网络模块， views:页面模块，utils:工具函数模块，router:路由模块，assets/css: css公共样式，assets/img:公共图片  store: vuex相关

10. vue.config.js : 配置路径，省略代码书写时 路径

11. 安装elementUI command: npm i element-ui -S   使用方式有两种：全部引入 和 按需引入  本毕设采用全部引入方式  

12. 安装axios command: npm install axios --save

13. 安装less command: npm i less --save-dev 

14. 全局样式设置 css 直接复制之前项目的两个基本样式  common.less mixin.less

15. 在network模块建立两个js文件，request.js  和 api.js    request.js：网络请求封装  api.js：接口封装

16. 安装 qs 模块 它将参数序列化成url格式 以 & 相连接 command: npm install qs

```javascript
var a = {name:'hehe',age:10};
 qs.stringify(a)
// 'name=hehe&age=10'
JSON.stringify(a)
// '{"name":"hehe","age":10}'

//本地测试跨域解决
//在vue.config.js中配置
  devServer: {  // webpack devserver的proxy用法解决开发环境的跨域问题(不用在去配置nginx和host)
    // 请求到 /api/xxx 现在会被代理到请求 http://localhost:8090/api/xxx
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8090',
        ws: true,//是否代理websockets
        changeOrigin: true  // 设置同源 默认false，是否需要改变原始主机头为目标URL
      }
    }
  }

```

### 3.项目编写

17.开始前端页面编写，首先是登录界面，还要兼容手机

18.使用vuex来管理状态（登录） vuex:集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化 

```javascript
state，驱动应用的数据源；
view，以声明方式将state映射到视图；
actions，响应在view上的用户输入导致的状态变化。
```

![img](https://upload-images.jianshu.io/upload_images/4822713-e65694af7ffeb5be.png?imageMogr2/auto-orient/strip|imageView2/2/w/1080/format/webp) 

当我们的应用遇到多个组件共享状态时，单向数据流的简洁性很容易被破坏 

1. 多个视图依赖于同一状态。
2. 来自不同视图的行为需要变更同一状态。

对于问题一，传参的方法对于多层嵌套的组件将会非常繁琐，并且对于兄弟组件间的状态传递无能为力。对于问题二，我们经常会采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。以上的这些模式非常脆弱，通常会导致无法维护的代码。

因此，我们为什么不把组件的共享状态抽取出来，以一个全局单例模式管理呢？在这种模式下，我们的组件树构成了一个巨大的“视图”，不管在树的哪个位置，任何组件都能获取状态或者触发行为！

另外，通过定义和隔离状态管理中的各种概念并强制遵守一定的规则，我们的代码将会变得更结构化且易维护。

这就是 Vuex 背后的基本思想，Vuex 是专门为 Vue.js 设计的状态管理库，以利用 Vue.js 的细粒度数据响应机制来进行高效的状态更新

```
npm install vuex --save
```

 `Vuex` 的状态存储是`响应式`的。当 `Vue`组件从 `store`中读取状态的时候，若 `store` 中的状态发生变化，那么相应的组件也会相应地得到高效更新。

你不能直接改变 `store`中的状态。改变`store`中的状态的唯一途径就是显式地提交`(commit) mutations`。这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

 在main.js中添加

```
import Vuex from 'vuex'
Vue.use(Vuex)
```

 computed 和 watch

- computed用来监控自己定义的变量，该变量不在data里面声明，直接在computed里面定义，然后就可以在页面上进行双向数据绑定展示出结果或者用作其他处理；
- computed比较适合对多个变量或者对象进行处理后返回一个结果值，也就是数多个变量中的某一个值发生了变化则我们监控的这个值也就会发生变化，举例：购物车里面的商品列表和总金额之间的关系，只要商品列表里面的商品数量发生变化，或减少或增多或删除商品，总金额都应该发生变化。这里的这个总金额使用computed属性来进行计算是最好的选择
- watch主要用于监控vue实例的变化，它监控的变量当然必须在data里面声明才可以，它可以监控一个变量，也可以是一个对象 
- watch一般用于监控路由、input输入框的值特殊处理等等，它比较适合的场景是一个数据影响多个数据
- computed 比 方法好，因为对于拿数据，假如数据没有变化，是不会计算的，直接返回缓存好的，但方法没有缓存

 虽然state和data有很多相似之处,但state在使用的时候一般被挂载到子组件的computed计算属性上,这样有利于state的值发生改变的时候及时响应给子组件. 

  实际作用:当一个组件需要获取多个状态时候，将这些状态都声明为计算属性会有些重复和冗余。为了解决这个问题，我们可以使用 `mapState` 辅助函数帮助我们生成计算属性，让你少按几次键 

mapState通过扩展运算符将store.state.adminInfo 映射this.adminInfo  这个this 很重要，这个映射直接映射到当前Vue的this对象上。

所以通过this都能将这些对象点出来，同理，mapActions, mapMutations都是一样的道理

npm install vue-router --save

#### 监控平台开发【将五邑大学视为景区，方便后面测试】

重新分析 mqtt 架构

当前情况是监控平台只订阅了四个主题，创建游客，销毁游客，更新游客，游客求助。设备端连接mqtt服务器后发送自己的消息到创建游客主题，完成创建。但是当监控平台对某个游客进行发送消息时，如何确定。



##### 数据流向：从mqtt服务器到监控平台。

监控平台订阅了mqtt服务器，当游客设备上传数据至mqtt服务器时，监控平台将接收到mqtt服务器发来的数据。

1.监控平台将会为每个游客创建一个地图标记。

游客设备【发布端】将会发送一个创建指令到监控平台，监控平台监听【订阅端】到后，生成对应的游客标记。

2.地图标记上会提示该游客的一些信息。

3.更新游客信息

游客设备定时发送游客数据到监控平台，监控平台拿到数据后根据游客id进行游客标记更新。

4.游客求助

游客设备【发布端】发送一个求助指令到监控平台，监控平台监听【订阅端】到后，警报给管理员。

5.当游客离开景区，mqtt服务器发送游客标记销毁信息到监控平台。

游客设备【发布端】将会发送一个销毁指令【销毁按键】，监控平台【订阅端】监听到后，取销毁对应的游客标记

##### 数据流向：从监控平台到mqtt服务器。

游客设备使用switch可判断指令类型。指令1：售票系统将门票信息发送给游客设备。指令2：监控平台需要将游客分布情况【拥堵概率、时段和程度】发送至游客设备。指令3：电子围栏报警【进入禁入区域，监控平台发送报警至设备，同时通知管理员】。 指令4：进入景点提醒【游客进入景点，监控平台发送提醒】

 1.设置电子围栏，有两种围栏，禁区和景点，红色和绿色围栏。当进入红色围栏区域，发送警报。当进入绿色区域，发送提示信息。

2.售票，将门票信息发给mqtt服务器

3.监控平台会对游客分布的情况进行分析和预测。将【拥堵概率、时段和程度】发送给游客设备。通过网格质心合并算法

![aHR0cHM6Ly9tbWJpei5xcGljLmNuL3N6X21tYml6X3BuZy9OWFNmWG5LTnZUNjR3eFBzSno4QXlPNHMzNFk1YkRqMzZ6RUplR3BmalNWNXNubjFES1loeUZRTDRTaWFJNnBHUDVFTFVweUZyZnR2M0FqQ0JSb2FBS1EvNjQw](D:\profession\graduation_design\code\test\mapGvl\aHR0cHM6Ly9tbWJpei5xcGljLmNuL3N6X21tYml6X3BuZy9OWFNmWG5LTnZUNjR3eFBzSno4QXlPNHMzNFk1YkRqMzZ6RUplR3BmalNWNXNubjFES1loeUZRTDRTaWFJNnBHUDVFTFVweUZyZnR2M0FqQ0JSb2FBS1EvNjQw.png)

 

 通过判断聚合后的坐标，提示拥挤的位置。

mqtt不能接收到一个数据就渲染一次。因为高德地图底层肯定也是最终渲染dom.如果接收一个游客的信息就修改，将会消耗大量性能。可以使用一个map来维护游客信息，设备端更新数据的频率可以高一些。但监控平台更新频率稍微慢些。比如设备端三分钟上传一次。监控平台6分钟更新一次。但是游客创建和销毁应该要立刻更新。

因为没有直接更新的api，所以



接下来需要固定地图及视图。即是固定景区的视图  目标五邑大学

1.api 限定地图显示范围

2.地图的热点

3.设定不可缩放

为了方便，将各种功能整理为一个功能菜单 ：专注于保护游客的生命安全和景区环境

1.限定景区：限定景区的显示范围

2.电子围栏：矢量图像绘制api+几何关系判断api

3.距离测量

4.根据游客求助位置生成一条从管理员中心到达该位置的路径。 方便管理员指挥。



#### mongo iot

为什么选择mongo，首先从Iot系统特点进行分析。

1. 海量数据：水平扩展
2. 灵活的数据模型：原生支持
3. 高并发访问：水平扩展
4. 区域分散性：设备分散在各个区域，但mongo支持区域分片
5. 分析需求：数据的价值在于分析，mongo分析功能强大 如按aggregation
6. 数据乱序：数据模型 + 服务端处理

数据模型：分桶模式

把n条数据聚合后放在一个文档里，如可以将某个游客的所有信息聚合到一个文档。其意义是：如一个游客的id,姓名，性别，这些数据在他进入景区后都是不变的。分桶模式可以避免这些数据重复插入。且因为iot数据一般不需要细粒度查询，所以将地理位置、体温这些数据聚合到一个文档也不影响使用

![1644811215495](C:\Users\32705\AppData\Local\Temp\1644811215495.png)



 桶间有序，桶内无序，应用侧桶内排序

数据库文档模型的优势：

- 读写效率高-由于文档模型把相关数据集中在一块，在普通机械盘上读数据的时候不用花太多时间去定位磁头，因此在IO性能上有先天独厚的优势；
- 可扩展能力强-关系型数据库很难做分布式的原因就是多节点海量数据关联有巨大的性能问题。如果不考虑关联，数据分区分库，水平扩展就比较简单；
- 动态模式-文档模型支持可变的数据模式，不要求每个文档都具有完全相同的结构。对很多异构数据场景支持非常好；
- 模型自然-文档模型最接近于我们熟悉的对象模型。从内存到存储，无需经过ORM的双向转换，性能上和理解上都很自然易懂。