import Vue from "../src/index.js"

describe('Demo', function () {
  afterEach(() => {
    document.body.append(document.createElement('br'))
    document.body.append(document.createElement('br'))
    document.body.append(document.createElement('br'))
  })
  it('Basic', function () {
    const title = document.createElement('h2')
    title.textContent = 'Basic Demo'
    document.body.append(title)
    var vm = new Vue({
      data() {
        return {
          a: 0
        }
      },
      render(h) {
        return h('button', {
          on: { 'click': this.handleClick }
        }, this.a)
      },
      methods: {
        handleClick() {
          this.a++
          console.log('a', this.a)
        }
      }
    }).$mount()

    document.body.append(vm.$el)
  })
  it('Mvvm in depth', function () {
    const title = document.createElement('h2')
    title.textContent = 'Mvvm In depth'
    document.body.append(title)

    const vm = new Vue({
      data() {
        return {
          a: [{}],
        }
      },
      render(h) {
        /* 
            div > button - [div > button - button - textContent - button]
        */
        return h('div', {}, [

            h('button', {
              on: { 'click': _ => this.appendRow() }
            }, 'Append Row'),

            h('ul', {}, this.a.map((item, i) => {
              return h('li', {}, [
                h('button', {
                  on: { 'click': _ => this.setNumber(item) }
                }, 'Set Number'),
                h('button', {
                  on: { 'click': _ => this.deleteNumber(item) }
                }, 'Delete Number'),
                h('span', {}, item.number || 0),
                h('button', {
                  on: { 'click': _ => this.removeRow(i) }
                }, 'Remove Row'),
                h('br', {}, '')
              ])
            })

          )]
        )
      },
      methods: {
        setNumber(item) {
          item.number = (Math.random() * 100).toFixed(4)
        },
        deleteNumber(item) {
          delete item.number
        },
        appendRow() {
          this.a.push({})
        },
        removeRow(idx) {
          this.a.splice(idx, 1)
        }
      }
    }).$mount()

    document.body.append(vm.$el)
  })
})