# mVue
  简单仿实现 Vue3 + 测试框架 Karma + jasmine
  
  Vue3
  
  Vue 从 2.x 到 3.x 最大的变化就是撇弃了先前使用 `Object.defineProperty` 对属性的 `set` 和 `get` 进行劫持的手段，而是用了 ES6 的新规范 `Proxy` 对象劫持，这一举动表示 Vue 将彻底不支持 IE 浏览器，即使使用 babel-polyfill 也无法完全转换 `Proxy` 对象. Vue2.x 版本中，vue 无法检测数组长度变化，而通过重写 Array 的 8 个方法，对于特殊变化，用户只能通过使用 `this.$set` 方法，该方法就是当场使用 `Object.defineProperty` 直接对传入的数组对象进行劫持。而采用 `Proxy` 的方式进行对象劫持也完美解决了对数组和对象内部数据检测的问题，对比前者而言在性能上提高了不少，也降低了用户自己操作代码的空间。
  
  所以这里尝试使用 `Proxy` 的模式简单实现一下 Vue3。
  
## 原理笔记：
   1.模块区分
   ```
      | dep.js -- 依赖收集模块，负责 deep collect dependence, 对应 Vue2.x 中的 dep.js
      | index.js -- 主 Vue 模块
      | proxy.js -- proxy 创建模块，负责 proxy 对象劫持的模块，
      | vnode.js -- 虚拟节点构造器，暂时用来保存虚拟节点的数据(tag, data, children, 组件的options和组件实例)
      | watcher.js -- 监听模块，包括 Watcher 和 ComputedWatcher，只负责存储 Watch 的对象信息和相应回调，
                      主要的 observer 仍旧在 index 主模块执行监听
      | util.js -- 常用工具函数`
   ```
   2.用 ES6 proxy 做对象劫持，监听调用 vm 对象的过程，并在其中插入自己的方法，实现对应的功能
   
   ~~3.用 $watch 和 notifyDataChange 方法实现一个简单的订阅模式，将订阅信息存入 dataNotifyChain 对象中，当调用对应的属性 set 时，触发 notifyDataChange 调用 dataNotifyChain 对象中对应的 key 的回调方法，通过 $watch 和 update 实现一系列 dom 节点替换和事件回调触发~~
   
   3. 调用 `$watch` 中将对应的 key 实例化为一个 `Dep` 对象, 用对象的 `addSub` 方法，存入 `new Watcher(this.proxy, key, cb)`
      `Dep` 对象和 `Watcher` 对象配合，实现订阅模式，当属性被调用时，就会触发 `notifyChange` 方法调用对应的 `Dep` 对象的 `notify` 方法
      触发 `Watcher` 中的回调。
   
   4. `setTarget` 和 `clearTarget` 
   
   5.mounted 触发首次 update 经 render 后生成 vnode 再通过 createDom 生成 dom 赋值给 $el(虚拟 dom 对象)

   6.render 创建 vnode，用 createElement 暂存数据，节点属性为 vnode.data.attrs, 子节点用 Array 或者 string 承载，多个节点用 dom Array 的方式渲染，若是文本节点，则直接替换element.textContent 值，监听事件直接用 element.addEventListener

## Ⅰ.Initialize
   1. 实例化 options 传入配置 options 中例如有 data () { return { a:{b:1} } }

   2. 初始化 props

   3. 初始化 proxy => createProxy()

   4. 初始化 watch => 
            this.initWatch() 获取 vue 实例中的 watch 对象执行依赖收集
                 判断 watch 目标是否在 data 或者 computed 中
                 若在 data 中，则调用 this.$watch 执行依赖收集，将
            this.initWatcher() 设置 this.deps = {}

   5. 返回 this.proxy

## Ⅱ.Mvvm 过程
   1. 属性更改 如 vm.a.b = 2
     
   2. 触发 proxy 拦截的 get 方法
   ```
    ① 依赖收集 进入 collect 方法
        collect 方法
        
        | 判断 this.collected 中是否已收集该属性，若已收集则其订阅信息已经存储
        | 若无，则调用 this.$watch(key, this.update.bind(this)) 对该属性进行订阅
        | 若该值为对象类，则进行深度收集，通过递归返回 new proxy，传入上层的 key 值对每个属性进行订阅
        | this.collected[key] = true
        
    ② 属性 set 将数据中 obj[key] 设置为 value，调用 this.notifyDataChange
        notifyDataChange 方法
        
        | 查询订阅链上 this.dataNotifyChain 的该 key 项
        | 调用其回调方法 即 update 方法
        | update 方法
          | 数据变更后 重新调用 createElement 结合新数据产生新节点
          | 判断当前节点是否有父节点， 若有则用 replaceChild 置换父节点的子节点，若无则直接进行替换
          | 页面产生更新
   ```
## III. 组件设计实现
   1. props实现
     ① 在属性 get 方法调用时，默认先取 props 的数据

........后续
      
