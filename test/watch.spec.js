import Vue from "../src/index.js"

describe('Watch', function () {
    it('Data', function () {
        var cb = jasmine.createSpy('cb')
        var vm = new Vue({
            data () {
                return {
                    a: 1,
                }
            },
            watch:{
                a (oldVal, newVal) {
                    cb(oldVal, newVal)
                } 
            },
            render (h) {
                return h('div', {}, this.b)
            }
        }).$mount()

        vm.a = 2
        expect(cb).toHaveBeenCalledWith(1, 2)
    });
    it('computed', function () {
        var cb = jasmine.createSpy('vb')
        const vm = new Vue({
            data () {
                return {
                    a:1
                }
            },
            computed: {
                b () {
                    return this.a + 1
                }
            },
            watch: {
                b (oldVal, newVal) {
                    cb(this.b, oldVal, newVal)
                }
            }
        })
        expect(vm.b).toEqual(2)
        vm.a = 10
        expect(vm.b).toEqual(11)
        expect(cb).toHaveBeenCalledWith(11, 2, 11)
    })
})