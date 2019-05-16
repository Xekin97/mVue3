import Vue from "../src/index"

describe('Lifecycle', () => {
    var cb = jasmine.createSpy('cb')
    it('mounted', () => {
        new Vue({
            mounted(){
                cb()
            },
            render (h) {
                return h('div', null, 'hello')
            }
        }).$mount()
        expect(cb).toHaveBeenCalled()
    })
})