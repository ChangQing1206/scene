// 游客类
// 方法
// 游客求助
class vistor {
  constructor(identity, name, bodyTem, position, visited_point) {
    this.identity = identity;  // 游客身份证  type: String
    this.name = name;  // 游客姓名  type: String
    this.bodyTem = bodyTem;  // 游客体温  type: Number[float]
    this.position = position; // 游客位置
    this.visited_point = visited_point; // 游客去过的景点
    // 游客求助
    this.getHelp = function() {
      alert(this.name + "need help ! The position is at longtitude of" + this.positionLong + "latitude of " + this.latitude);
    }
  }
}

export default vistor;