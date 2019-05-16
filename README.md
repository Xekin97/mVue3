# mVue
  简单仿实现 Vue3 + 测试框架 Karma + jasmine
  
## 原理笔记：
   1.用 ES6 proxy 做对象劫持，劫持当前 this 即 vm 对象并返回 proxy

   2.用 $watch 和 notifyDataChange 方法实现一个简单的订阅模式，将订阅信息存入 dataNotifyChain 对象中，当调用对应的属性 set 时，触发 notifyDataChange 调用 dataNotifyChain 对象中对应的 key 的回调方法，通过 $watch 和 update 实现一系列 dom 节点替换和事件回调触发

   3.collect 方法完成依赖收集 完成的收集存入 this.collected 对象中，在调用 this 的 get 方法时，会收集当前属性的所有依赖(deep)

   4.mounted 触发首次 update 经 render 后生成 vnode 再通过 createDom 生成 dom 赋值给 $el(虚拟 dom 对象)

   5.render 创建 vnode，用 createElement 暂存数据，节点属性为 vnode.data.attrs, 子节点用 Array 或者 string 承载，多个节点用 dom Array 的方式渲染，若是文本节点，则直接替换element.textContent 值，监听事件直接用 element.addEventListener

## Ⅰ.Initialize
   1. 实例化 options 传入配置 options 中例如有 data () { return { a:{b:1} } }

   2. 初始化 props

   3. 初始化 proxy => this.initDataProxy()

   4. 初始化 watch => this.initWatch() 设置 this.dataNotifyChain = {}

   5. 返回 this.proxy

## Ⅱ.Mvvm 过程
   1. 属性更改 如 vm.a.b = 2
     
   2. 触发 proxy 拦截的 get 方法
   
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

## III. 组件设计实现
   1. props实现
     ① 在属性 get 方法调用时，默认先取 props 的数据

........后续
      
