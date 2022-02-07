// 游客类
// 方法
// 游客求助
class vistor {
  constructor(clientId, name, bodyTem, deposit, consume, goodsName, positionLong, positionLati) {
    this.clientId = clientId;  // 游客id  type: String
    this.name = name;  // 游客姓名  type: String
    this.bodyTem = bodyTem;  // 游客体温  type: Number[float]
    this.deposit = deposit;  // 游客充值金额  type: Number
    this.consume = consume;  // 游客消费金额  type: Number
    this.goodsName = goodsName;  // 游客消费名称  type: Array
    this.positionLong = positionLong;  // 游客经度  type: Array
    this.positionLati = positionLati;  // 游客维度
    // 游客求助
    this.getHelp = function() {
      alert(this.name + "need help ! The position is at longtitude of" + this.positionLong + "latitude of " + this.latitude);
    }
  }
}

export default vistor;