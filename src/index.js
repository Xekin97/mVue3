import VNode, {createEmptyVNode} from './vnode.js'


class Vue {
    constructor (opt, name) {
        this.$options = opt

        this.initProps() // props
        this.proxy = this.initDataProxy()
        this.initWatch()
        
        return this.proxy
    }
    // $watch 和 notifyDataChange 实现了简单的观察者模式， 所有订阅信息存入 dataNotifyChain。
    $watch (key, cb) {
        this.dataNotifyChain[key] = this.dataNotifyChain[key] || []
        cb && this.dataNotifyChain[key].push(cb)
    }
    // $mount 会触发首次渲染，经 render 后生成 vnode，再通过 createDom 生成 dom，赋值给 $el
    $mount (root) {
        // const { mounted, render } = this.$options
        // const vnode = render.call(this.proxy, this.createElement)

        // this.$el = this.createDom(vnode)
        // // 若有根节点， 将子节点替换 this.$el
        // if (root) {
        //     const parent = root.parentElement
        //     parent.replaceChild(this.$el)
        // } 
        this.$el = root
        // first render
        this.update()
        const { mounted } = this.$options

        mounted && mounted.call(this.proxy)
        // 返回 vue 实例
        return this
    }
    // mvvm
    update () {
        const parent = (this.$el || {}).parentElement
        const vnode = this.$options.render.call(this.proxy, this.createElement)
        const newNode = this.patch(null, vnode)

        if (parent) {
            parent.replaceChild(newNode, this.$el)
        }

        this.$el = newNode
    }
    patch (oldVnode, newVnode) {
        return this.createDom(newVnode)
    }
    createElement (tag, data, children) {
        return new VNode(tag, data, children)
    }
    createDom (vnode) {
        const el = document.createElement(vnode.tag)
        el.__vue__ = this
        
        const data = vnode.data || {}
        const attributes = data.attrs || {}

        // dom attr 属性
        for (let key in attributes) {
            el.setAttribute(key, attributes[key])
        }

        // class 跟 attr 同级 
        const className = data.class
        className && el.setAttribute('class', className);

        // dom 事件监听
        const events = data.on || {}
        for (let key in events) {
            el.addEventListener(key, events[key])
        }

        if (!Array.isArray(vnode.children)) {
            el.textContent = String(vnode.children)
        } else {
            vnode.children.forEach(child => {
                if (typeof child === 'string') {
                    el.textContent = child
                } else {
                    el.appendChild(this.createDom(child))
                }
            })
        }
        return el
    }
    initDataProxy () {        
        const createDataProxyHandler = path => {
            return {
                set: (obj, key, value) => {
                    const fullPath = path ? path + '.' + key : key
                    const pre = obj[key]
                    obj[key] = value
                    this.notifyDataChange(fullPath, pre, value)
                    return true
                },
                get: (obj, key) => {
                    // 对于data和props中的深层object：
                    // 读操作时，通过递归为每一个不是叶子节点的属性创建代理
                    // 从而实现对每一个节点做依赖收集（根节点+中间节点+叶子节点）
                    const fullPath = path ? path + '.' + key : key
                    // 依赖收集
                    this.collect(fullPath)
                    if(typeof obj[key] === 'object' && obj[key] !== null) {
                        return new Proxy(obj[key], createDataProxyHandler(fullPath))
                     } else {
                         return obj[key]
                     }
                },
                deleteProperty: (obj, key) => {
                    if (key in obj) {
                        const fullPath = path ? path + '.' + key : key
                        const pre = obj[key]
                        delete obj[key]
                        this.notifyDataChange(fullPath, pre)
                    }
                    return true
                }
            }
        }

        const data = this.$data = this.$options.data ? this.$options.data() : {}
        const props = this._props
        const methods = this.$options.methods || {}

        const handler = {
            set: (_, key, value) => {
                if (key in props) {
                    return createDataProxyHandler().set(props, key, value)
                }else if (key in data) {
                    return createDataProxyHandler().set(data, key, value)
                } else {
                    this[key] = value
                }
                return true
            },
            get: (_, key) => {
                // props => data => methods
                if (key in props) return createDataProxyHandler().get(props, key)
                else if (key in data) return createDataProxyHandler().get(data, key)
                else if (key in methods) return methods[key].bind(this.proxy)
                else return this[key]
            }
        }
        return new Proxy(this, handler)
    }
    collect (key) {
        this.collected = this.collected || {}
        if (!this.collected[key]) {
            this.$watch(key, this.update.bind(this))
            this.collected[key] = true
        }
    }
    initWatch () {
        this.dataNotifyChain = {}
    }
    notifyDataChange (key, pre, val) {
        (this.dataNotifyChain[key] || []).forEach(cb => cb(pre, val))
    }
    initProps () {
        this._props = {}
        const {props: propsOptions, propsData} = this.$options
        if (!propsOptions || !propsOptions.length) return
        propsOptions.forEach(key => {
            this._props[key] = propsData[key]
        })
    }
}

export default Vue