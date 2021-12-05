function Bus () {
  this.listeners = {}
}
Bus.prototype.listen = function (name, fn) {
  if (!this.listeners[name]) {
    this.listeners[name] = []
  }
  this.listeners[name].push(function (_this, args, stack) {
    curStacks.push(stack)
    curStacks.forEach(stack => {
      stack.push({
        name,
        fnName: fn.name
      })
    })
    fn.apply(_this, args)
  })
}
Bus.prototype.trigger = function (name, ...args) {
  const trigger = createTriggerFn()
  trigger.call(this, name, ...args)
  curStacks.pop()
  return trigger
}

let curStacks = []
function createTriggerFn () {
  let stack = []
  function innerTrigger (name, ...args) {
    const curTypeListeners = this.listeners[name]
    for (let i = 0; i < curTypeListeners.length; i++) {
      curTypeListeners[i](this, args, stack)
    }
  }
  innerTrigger.stack = stack
  return innerTrigger
}

const bus = new Bus()
bus.listen('testEvent', function callback1(){
  this.trigger('testEvent2')
})

bus.listen('testEvent2', function callback2(){
})

let triggerFn = bus.trigger('testEvent', 1, 2)
let stackTxt = triggerFn.stack.map((stackObj, i) => `
  ${new Array(i * 2).fill('\t').join('')}|-event: ${stackObj.name}\n
  ${new Array(i * 2 + 1).fill('\t').join('')}|-callback: ${stackObj.fnName}
`).join('')
console.log('stackTxt', stackTxt)

// 只实现到了难度2
// 每次trigger都有独立的调用栈，所以必须建一个和trigger调用映射的stack -> 闭包实现
// trigger嵌套调用时，总线需要知道当前listener是嵌套调用进来的，还是直接进来的，用了全局变量curStacks存储当前调用栈
// 最内层的trigger触发时，尾部的stack应最先从curStacks弹出