import VNode from './vnode.js'

class Vue {
    constructor (opt) {
        this.$options = opt

        const proxy = this.initDataProxy()
        this.initWatch()

        return proxy
    }
    initDataProxy () {
        const data = this.$options.data() ? this.$options.data() : {}

        return new Proxy(this, {
            set: (_, key, value) => {
                if(key in data) {
                    const pre = data[key]
                    data[key] = value
                    this.notifyDataChange(key, pre, value)
                } else {
                    this[key] = value
                }
                return true
            },
            get: (_, key) => {
                if(key in data) return data[key] // 优先取类方法和属性
                else return this[key]
            }
        })
    }
    notifyDataChange (key, pre, val){
        (this.dataNotifyChain[key] || []).forEach(cb => cb(pre, val))
    }
    $mount (root) {
        const vnode = this.$options.render(this.createElement)
        this.$el = this.createDom(vnode)
        if (root) this.$el = root
        return this
    }
    createDom (vnode) {
        const el = document.createElement(vnode.tag)
        for (let key in vnode.data) {
            el.setAttribute(key, vnode.data[key])
        }
        if ( typeof vnode.children === 'string') {
            el.textContent = vnode.children
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
    $watch (key, cb) {
        this.dataNotifyChain[key] = this.dataNotifyChain[key] || []
        this.dataNotifyChain[key].push(cb)
    }
    initWatch () {
        this.dataNotifyChain = {}
    }
}

export default Vue