import Vue from "../src/index.js"

describe('Component', function(){
    it('render vnode with component', () => {
        var vm = new Vue({
            data () {
                return {
                    msg1: 'hello',
                    msg2: 'world'
                }
            },
            components: {
                'my-component' : {
                    props: ['msg'],
                    render (h) {
                        return h('p', null, this.msg)
                    }
                }
            },
            render (h) {
                return h('div', null, [
                    h('my-component', {props: {msg: this.msg1}}),
                    h('my-component', {props: {msg: this.msg2}})
                ])
            }
        }).$mount()

        expect(vm.$el.outerHTML).toEqual(`<div><p>hello</p><p>world</p></div>`)
    });
    it('component mvvm', () => {
        const vm = new Vue({
            data () {
                return {
                    parentMsg: 'hello'
                }
            },
            components: {
                'my-component': {
                    props: ['msg'],
                    render (h) {
                        return h('p', null, this.msg)
                    }
                }
            },
            render (h) {
                return h('my-component', {props: {msg: this.parentMsg}})
            }
        }).$mount()

        expect(vm.$el.outerHTML).toEqual('<p>hello</p>')
        vm.parentMsg = 'world'
        expect(vm.$el.outerHTML).toEqual('<p>world</p>')
    });
    it('event & action', () => {
        var cb = jasmine.createSpy('cb');

        const vm = new Vue({
            components: {
                'my-component': {
                    render (h) {
                        return h('div', {}, 'my-component')
                    },
                    mounted () {
                        this.$emit('mounted', {payload: "payload"})
                    }
                }
            },
            render (h) {
                return h('my-component', {
                    on: { mounted: cb}
                })
            }
        }).$mount()
        expect(cb).withContext(vm)
        expect(cb).toHaveBeenCalledWith({payload: "payload"})
    })
})