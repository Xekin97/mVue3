import VNode from './vnode.js'
import {Watcher, ComputedWatcher} from './watcher.js'
import Dep from './dep.js'
import {createProxy, setTarget, clearTarget } from './proxy.js'

class Vue {
    constructor (opt, name) {
        this.$options = opt

        this.initProps() // props
        // this.proxy = this.initDataProxy()
        this.proxy = createProxy(this)
        this.initWatcher()
        this.initWatch()
        
        return this.proxy
    }
    $emit (...options) {
        const [name, ...rest] = options
        const cb = this._events[name]
        cb && cb(...rest)
    }
    // $watch 和 notifyDataChange 实现了简单的观察者模式， 所有订阅信息存入 dataNotifyChain。
    $watch (key, cb) {
        // this.dataNotifyChain[key] = this.dataNotifyChain[key] || []
        // cb && this.dataNotifyChain[key].push(cb)
        if (!this.deps[key]) {
            this.deps[key] = new Dep()
        }
        this.deps[key].addSub(new Watcher(this.proxy, key, cb))
    }
    // $mount 会触发首次渲染，经 render 后生成 vnode，再通过 createDom 生成 dom，赋值给 $el
    $mount (root) {
        this.$el = root
        // first render
        // this._duringFirstRendering = true
        // this.update(true)
        // this._duringFirstRendering = false

        // collect dependences
        setTarget(this)
        this.update()
        clearTarget()

        const { mounted } = this.$options

        mounted && mounted.call(this.proxy)
        // 返回 vue 实例
        return this
    }
    // mvvm
    update () {
        const parent = (this.$el || {}).parentElement
        const vnode = this.$options.render.call(this.proxy, this.createElement.bind(this))
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
        // 组件渲染
        const components = this.$options.components || {}
        if (tag in components) return new VNode(tag, data, children, components[tag])
        return new VNode(tag, data, children)
    }
    createDom (vnode) {
        const data = vnode.data || {}
        const attributes = data.attrs || {}

        // vnode is a component
        if (vnode.componentOptions) {
            const componentInstance = new Vue(Object.assign({}, vnode.componentOptions, { propsData: vnode.data.props}))
            vnode.componentInstance = componentInstance
            // 组件事件注册
            componentInstance._events = data.on || {}
            componentInstance.$mount()
            return componentInstance.$el
        }

        const el = document.createElement(vnode.tag)
        el.__vue__ = this
        
        
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
    // initDataProxy () {        
    //    

    //     const data = this.$data = this.$options.data ? this.$options.data() : {} // data
    //     const props = this._props   // props
    //     const methods = this.$options.methods || {} //methods
    //     const computed = this.$options.computed || {}  //computed

    //     const handler = {
    //         set: (_, key, value) => {
    //             if (key in props) { 
    //                 return createDataProxyHandler().set(props, key, value)
    //             } else if (key in data) { 
    //                 return createDataProxyHandler().set(data, key, value)
    //             } else {
    //                 this[key] = value
    //             }
    //             return true
    //         },
    //         get: (_, key) => {
    //             // props => data => methods
    //             if (key in props) return createDataProxyHandler().get(props, key) // first props
    //             else if (key in data) return createDataProxyHandler().get(data, key) // then data
    //             else if (key in computed) return computed[key].call(this.proxy) // then computed
    //             else if (key in methods) return methods[key].bind(this.proxy) // then methods
    //             else return this[key]
    //         }
    //     }
    //     return new Proxy(this, handler)
    // }
    // collect (key) {
    //     this._duringFirstRendering && this.$watch(key, this.update.bind(this))
    //     this._target && this.$watch(key, this._target.update.bind(this._target))
    // }
    initWatcher () {
        this.deps = {}
    }
    initWatch () {
        const watch = this.$options.watch || {}
        const computed = this.$options.computed || {}
        const data = this.$data

        for (let key in watch) {
            const handler = watch[key]
            if (key in data) {
                this.$watch(key, handler.bind(this.proxy))
            } else if (key in computed) {
                new ComputedWatcher(this.proxy, computed[key], handler)
            } else {
                throw "i don't know what you wanna do"
            }
        }
    }
    // notifyDataChange (key, pre, val) {
    //     (this.dataNotifyChain[key] || []).forEach(cb => cb(pre, val))
    // }
    notifyChange (key, pre, val) {
        const dep = this.deps[key]
        dep && dep.notify({pre, val})
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