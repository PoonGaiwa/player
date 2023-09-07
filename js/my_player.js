/*
 * @Author: gaiwa gaiwa@163.com
 * @Date: 2023-08-19 23:45:21
 * @LastEditors: gaiwa gaiwa@163.com
 * @LastEditTime: 2023-08-25 21:37:57
 * @FilePath: \html\work\mobile\day5\js\my_player.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: gaiwa gaiwa@163.com
 * @Date: 2023-08-19 23:45:21
 * @LastEditors: gaiwa gaiwa@163.com
 * @LastEditTime: 2023-08-24 23:53:50
 * @FilePath: \html\work\mobile\day5\js\my_player.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import Storage from './Storage.js'
class Storage {
  constructor(type="local"){
    this.storage = window[`${type}Storage`];
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
class MyVideo {
  constructor(player = document.querySelector('.video')){
    this.player = player;
    this.canPlay = false;
    this.isPaused = true;   // 视频播放状态 默认为暂停状态
    this._paused = this.isPaused;
    this.volume = 0.1;
    this.storage = new Storage('local');
    this.$ele = {
      $playBtn: document.querySelector('#contr-play'),
      $progress: document.querySelector('.progress-line'),
      $currentTime: document.querySelector('.player-current'),
      $countTime: document.querySelector('.player-count'),
      $progressUnit: document.querySelector('.progress-unit'),
      $full: document.querySelector('#contr-full'),
      $loop: document.querySelector('#contr-loop'),
      $volumeBtn: document.querySelector('#contr-volume'),
      $volumeRange: document.querySelector('#volume-range'),
    };
    this.progress = {
      isDown: false,
      startX: 0,
      width: 0,
      maxWidth: document.querySelector('.player-progress').offsetWidth
    };
    this.eventListener();
  }
  set isPaused(val){
    this._paused = val;
    if(val === true){
      this.myPlay();
      return false;
    }
    this.myPause();
  };
  get isPaused() {
    return this._paused;
  }
  set volume(val) {
    this._volume = val;
    this.player.volume = val;
  }
  get volume(){
    return this._volume;
  }
  // 初始化
  initPlayer(){
    if(this.canPlay){
      return false;
    }
    let { $currentTime, $countTime} = this.$ele;
    this.volume = 0.1;
    this.player.volume = this.volume;
    this.canPlay = true;
    this.checkPlayHistory();
    $currentTime.innerText = this.getCurrentTime();
    $countTime.innerText = this.getCountTime();
    this.switchBtn(this.isPaused);
  }

  checkPlayHistory(){
    let current = ~~this.storage.getStorage(this.player.src);
    if(!current){
      return false;
    }
    this.setCurrentTime(null,current);
  }
  eventListener(){
    const dragMap = {
      'mousedown': (e) => {
        if(this.progress.isDown){
          return false;
        }
        this.progress.startX = e.clientX;
        this.progress.isDown = true;
        this.progress.width = this.$ele.$progress.offsetWidth;
        this.isPaused = false;
        this.switchBtn(this.isPaused);
      },
      'mousemove': (e) => {
        if(!this.progress.isDown){
          return false;
        }
        let _x = e.clientX - this.progress.startX;
        let width = _x + this.progress.width;
        let ratio = width / this.progress.maxWidth;
        let time = ratio * this.player.duration;
        this.setCurrentTime(null,time);
      },
      'mouseup': (e) => {
        // 抬起鼠标时 判断鼠标位置是否在进度条上
        if(/progress/g.test(e.target.className)){
          let _x = e.clientX - this.$ele.$progress.getBoundingClientRect().left;
          let ratio = _x / this.progress.maxWidth;
          let time = ratio * this.player.duration;
          this.setCurrentTime(null,time);
        }
        if(!this.progress.isDown){
          return false;
        }
        this.progress.isDown = false;
        this.isPaused = true;
        this.switchBtn(this.isPaused);
      }
    }
    this.$ele.$playBtn.addEventListener('click',()=>{
      this.isPaused = this.player.paused;
      if(!this.canPlay){
        return false;
      }
      this.switchBtn(this.isPaused);
    },false);

    this.player.addEventListener('canplay',this.initPlayer.bind(this));
    this.player.addEventListener('timeupdate',this.setCurrentTime.bind(this));
    this.$ele.$full.addEventListener('click',this.changeFullScreen.bind(this));
    this.$ele.$loop.addEventListener('click',this.changeLoop.bind(this));
    this.$ele.$volumeRange.addEventListener('change',this.changeVolume.bind(this));
    this.$ele.$volumeBtn.addEventListener('click',this.changeMuted.bind(this));
    // 当页面完全不可见时 存储视频播放信息
    document.addEventListener('visibilitychange',() => {
      if(document.hidden){
        this.isPaused = false;
        this.switchBtn();
        this.setVideoMsg()
      }
    })
    // 事件分流
    const drag = (e) => {
      let type = e.type;
      if(dragMap.hasOwnProperty(type)){
        dragMap[type](e);
      }
    }
    this.$ele.$progressUnit.addEventListener('mousedown',drag,false);
    document.addEventListener('mousemove',drag,false);
    document.addEventListener('mouseup',drag,false);
  }
  switchBtn(condition){
    if(condition){
      this.$ele.$playBtn.classList.add('icon-pause');
      this.$ele.$playBtn.classList.remove('icon-play');
    }else{
      this.$ele.$playBtn.classList.remove('icon-pause');
      this.$ele.$playBtn.classList.add('icon-play');
    }
  }
  myPlay(){
    this.player.play();
  }
  myPause(){
    this.player.pause();
  }
  setCurrentTime(e,time){
    if (time){
      this.player.currentTime = time;
    }
    this.setProgress();
    this.$ele.$currentTime.innerText = this.getCurrentTime();
  }
  getCountTime(){
    return this.formatTime(this.player.duration);
  }
  getCurrentTime(){
    return this.formatTime(this.player.currentTime);
  }
  setProgress(done){
    let ratio = this.player.currentTime / this.player.duration * 100;
    if(done){
      this.progress.width = ratio * this.progress.maxWidth;
      return false;
    }
    this.$ele.$progress.style.width = ratio + '%';
  }
  // 全屏切换
  changeFullScreen(){
    if(!isFullScreen()){
      openFullScreen(this.player);
      return false;
    }
    closeFullScreen();
  }
  // 时间数据格式化
  formatTime(time){
    let [s,m,h] = [~~(time % 60),~~(time / 60),~~(time / 60 / 60)];
    [s,m,h] = [s,m,h].map(padLeft);
    return `${h}:${m}:${s}`;
  }
  changeLoop(e){
    this.player.loop = !this.player.loop;
    e.target.classList.toggle('is-loop');
  }
  changeMuted(e){
    e.target.classList.toggle('is-muted');
    this.player.muted = !this.player.muted;
  }
  changeVolume(e){
    let ratio = Number(e.target.value) / 100;
    this.player.volume = ratio;
  }
  // 存储观看信息 到本地存储
  setVideoMsg(){
    if(!this.canPlay){
      return false;
    }
    this.storage.setStorage({
      [this.player.src]: this.player.currentTime
    });
  }
}

function padLeft(num){
  return String(num)[1] && String(num) || '0' + num;
}
const myPlay = new MyVideo();
