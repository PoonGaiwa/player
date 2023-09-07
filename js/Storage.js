/*
 * @Author: gaiwa gaiwa@163.com
 * @Date: 2023-08-24 23:58:46
 * @LastEditors: gaiwa gaiwa@163.com
 * @LastEditTime: 2023-08-25 21:18:13
 * @FilePath: \html\work\mobile\day5\js\Storage.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

(function(w){
  class Storage {
    constructor(type="local"){
      this.storage = w[`${type}Storage`];
      this.history = {}
    }
    setStorage(...args){
      const len = args.length;
      if(len === 0) {
        return false;
      }
      if(len === 2) {
        if(args.every(item => typeof item !== 'object')){
          this.history[args[0]] = args[1];
          this.storage.setItem(String(args[0]),String(args[1]));
        }
        return {
          [args[0]]: args[1]
        }
      }
      if(len === 1) {
        if(Object.prototype.toString.call(args[0]) === "[object Object]"){
          let obj = args[0];
          Object.assign(this.history, obj);
          return Object.entries(obj).map(([key,value])=> {
            this.storage.setItem(key, value);
            return key;
          });
        }
      }
      return false;
    }
    getStorage(...args){
      const len = args.length;
      if(len === 0) {
        // 如果不传参数 返回所有的存储项目
        return this.history;
      }
      if(len === 1 && Object.prototype.toString.call(args[0]) === "[object Object]" && args[0].length){
        // 多个对象
        let arr = args[0].slice();
        return arr.reduce((acc, curr) => {
          acc[key] = this.storage.getItem(curr);
          return acc;
        },{});
        
      }
      if(len === 1 && typeof args[0] !== 'object' && args[0]){
        // 如果不传参数  返回所有的存储项目
        return sessionStorage.getItem(args[0]);
      }
    }
    removeStorage(...args){
      args = args.flat(Infinity);
      args.forEach(item => {
        if(typeof item!=='object'){
          if(this.history[item]){
            delete this.history[item];
          }
          this.setStorage.removeItem(String(item));
        }
      });
    }
    clearStorage(){
      this.history = {};
      this.storage.clear();
    }
  }
})(window)
