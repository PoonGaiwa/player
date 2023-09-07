/*
 * @Author: gaiwa gaiwa@163.com
 * @Date: 2023-08-24 23:58:46
 * @LastEditors: gaiwa gaiwa@163.com
 * @LastEditTime: 2023-08-26 21:01:34
 * @FilePath: \html\work\mobile\day5\js\common.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function openFullScreen (ele = document){
  const requestFullScreens = ['requestFullscreen', 'webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen'];
  for (let i =0;i<requestFullScreens.length; i++){
    let key = requestFullScreens[i];
    if (ele[key]){
      ele[key]();
      return false;
    }
  }
}

function closeFullScreen (){
  const exitFullScreens = ['exitFullscreen','webkitCancelFullScreen','mozCancelFullScreen','msExitFullscreen'];
  for (let i=0; i < exitFullScreens.length; i++){
    let key = exitFullScreens[i];
    if (ele[key]){
      ele[key]();
      return false;
    }
  }
}

function isFullScreen (){
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}
