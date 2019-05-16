import Vue from "../src/index"

describe('Raw vnode render', () => {
    it('basic usage', () => {
        const vm = new Vue({
            render (h) {
                return h('div', null, 'hello')
            }
        }).$mount()
        expect(vm.$el.tagName).toBe('DIV')
        expect(vm.$el.textContent).toBe('hello')
    })
})