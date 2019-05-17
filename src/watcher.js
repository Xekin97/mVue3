import { setTarget, clearTarget } from './proxy.js'

export class Watcher {
    constructor (vm, fn, cb) {
        this.vm = vm
        this.fn = fn
        this.cb = cb

        vm._target = this
        this.value = fn.call(this.vm)
        vm._target = null
    }
    update ({pre, val}) {
        this.cb.call(this.vm, pre, val)
    }
}

export class ComputedWatcher {
    constructor (vm, fn, cb) {
        this.vm = vm
        this.fn = fn
        this.cb = cb

        setTarget(this)
        this.value = this._get()
        clearTarget()
    }
    update () {
        const oldValue = this.value
        const value = this._get()
        this.cb.call(this.vm, oldValue, value)
    }
    _get () {
        return this.fn.call(this.vm)
    }
}