export default function (Vue) {
  // 千分钱数
  Vue.prototype.formatNumberRgx = function (num) {
    if (num == "" || num == null || num == 0) {
      return 0;
    } else {
      let parts = num.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
  };

  // 負數及带小数數字的獲取
  Vue.prototype.getPriceNum = function (value) {
    console.log(value);
    if (value != "") {
      let reg = /(\-)?\d+[0-9]*([.]{1}[0-9]+){0,1}/g;
      let m = value.toString().replace(/,/g, '').match(reg);
      console.log(m);
      return m ? m.join("") : value;
    } else {
      return "";
    }
  };
};