let _target = null

export function createProxy (vueInstance) {
    
    function collect (key) {
        _target && vueInstance.$watch(key, _target.update.bind(_target))
    }

    const createDataProxyHandler = path => {
        return {
            set: (obj, key, value) => {
                const fullPath = path ? path + '.' + key : key
                const pre = obj[key]
                obj[key] = value
                vueInstance.notifyChange(fullPath, pre, value)
                return true
            },
            get: (obj, key) => {
                // 对于data和props中的深层object：
                // 读操作时，通过递归为每一个不是叶子节点的属性创建代理
                // 从而实现对每一个节点做依赖收集（根节点+中间节点+叶子节点）
                const fullPath = path ? path + '.' + key : key
                // 依赖收集
                collect(fullPath)
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
                    vueInstance.notifyChange(fullPath, pre)
                }
                return true
            }
        }
    }
    const data = vueInstance.$data = vueInstance.$options.data ? vueInstance.$options.data() : {} // data
    const props = vueInstance._props   // props
    const methods = vueInstance.$options.methods || {} //methods
    const computed = vueInstance.$options.computed || {}  //computed

    const handler = {
        set: (_, key, value) => {
            if (key in props) { 
                return createDataProxyHandler().set(props, key, value)
            } else if (key in data) { 
                return createDataProxyHandler().set(data, key, value)
            } else {
                vueInstance[key] = value
            }
            return true
        },
        get: (_, key) => {
            // props => data => methods
            if (key in props) return createDataProxyHandler().get(props, key) // first props
            else if (key in data) return createDataProxyHandler().get(data, key) // then data
            else if (key in computed) return computed[key].call(vueInstance.proxy) // then computed
            else if (key in methods) return methods[key].bind(vueInstance.proxy) // then methods
            else return vueInstance[key]
        }
    }
    return new Proxy(vueInstance, handler)
}

export function setTarget (target) {
    _target = target
}

export function removeTarget () {
    _target = null
}