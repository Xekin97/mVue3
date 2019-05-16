
/**
 * @param {string} tag 
 * @param {object} data 
 * @param {array|string} children 
 */

export default function VNode (tag, data, children) {
    this.tag = tag
    this.data = data
    this.children = children
}

export function createEmptyVNode (val) {
    return new VNode(void 0, void 0, val)
}