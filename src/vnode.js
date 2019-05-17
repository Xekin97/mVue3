
/**
 * @param {string} tag 
 * @param {object} data 
 * @param {array|string} children 
 */

export default function VNode (tag, data, children, componentOptions, componentInstance) {
    this.tag = tag
    this.data = data
    this.children = children
    this.componentOptions = componentOptions
    this.componentInstance = componentInstance
}