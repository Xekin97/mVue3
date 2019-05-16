import Vue from "../src/index"

describe('Method', () => {
    it('Basic', () => {
        const vm = new Vue({
            methods: {
                test () {
                    return {
                        self: this,
                        msg: 'hello world!'
                    }
                }
            }
        })
        var ret = vm.test()
        expect(ret.self).toEqual(vm)
        expect(ret.msg).toEqual('hello world!')
    })
})