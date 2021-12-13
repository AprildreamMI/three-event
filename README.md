# three-event

基于[three-onEvent](https://github.com/YoneChen/three-onEvent)，对其有如下修改

+ 解决一些`bug`
+ 监听传入的`renderer.domElement`

## 功能

通过`THREE.Raycaster`方法[官方例子](https://codesandbox.io/s/she-xian-fa-shu-biao-xuan-qu-dui-xiang-8hfkv?file=/index.html:2925-2940)实现`Object3D`对象的选取

+ `click`

+ `hover`

  > 移入移出

## 使用方式

[例子](https://aprildreammi.github.io/three-event/example/example.html)

1. 安装

   依赖`threeJs`

   ```javascript
   npm i three-event
   ```

2. 使用

   ```javascript
   import ThreeEvent from './onEvent.js'
   
   // 初始化
   const threeOnEvent = new ThreeEvent({
       domElement: renderer.domElement,
       camera: camera
   });
   
   // click
   mesh.on('click', (mesh, event) => {
       // ...
   })
   
   // hover
   mesh.on('hover', (mesh, event) => {
       // 移入...
   }, (mesh, event) => {
       // 移出...
   })
   
   ```

   