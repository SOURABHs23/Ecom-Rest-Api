export default class OrderModel {
  constructor(userID, totalAmount, timestamp) {
    this.userID = userID;
    this.totalAmount = totalAmount;
    this.timestamp = timestamp;
  }
}
