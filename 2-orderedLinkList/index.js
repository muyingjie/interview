let class2type = {}
'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach((name) => {
	class2type[ "[object " + name + "]" ] = name.toLowerCase()
})
const type = obj => {
  if ( obj == null ) {
    return String(obj)
  }
  return typeof obj === "object" || typeof obj === "function" ?
    class2type[ Object.prototype.toString.call(obj) ] || "object" :
    typeof obj
}

function genErr (str) {
  throw new Error(str)
}

function getArrIds (arr) {
  return arr.map(o => o.id).join(',')
}

function getOrderedLinkList (arr) {
  if (arr.length === 0) return arr

  // 结构、类型检查
  let typeErrItems = arr.filter(item =>
    item.id === undefined ||
    type(item.id) !== 'number' ||
    item.before !== undefined && type(item.before) !== 'number' ||
    item.after !== undefined && type(item.after) !== 'number' ||
    item.first !== undefined && type(item.first) !== 'boolean' ||
    item.last !== undefined && type(item.last) !== 'boolean'
  )
  if (typeErrItems.length > 0) {
    genErr(`${getArrIds(typeErrItems)}基本结构、类型错误，请检查`)
  }

  const firstItems = arr.filter(item => item.first)
  const lastItems = arr.filter(item => item.last)
  if (firstItems.length > 1) {
    genErr(`检测到first多于1项: ${getArrIds(firstItems)}`)
  }
  if (lastItems.length > 1) {
    genErr(`检测到last多于1项: ${getArrIds(lastItems)}`)
  }

  const beforeFirstItems = firstItems.length === 1 && arr.filter(item => item.before === firstItems[0].id)
  const afterLastItems = lastItems.length === 1 && arr.filter(item => item.after === lastItems[0].id)
  if (beforeFirstItems.length > 0) {
    genErr(`错误：${getArrIds(beforeFirstItems)}比第一项还要靠前`)
  }
  if (afterLastItems.length > 0) {
    genErr(`错误：${getArrIds(afterLastItems)}比最后一项还要靠后`)
  }

  const tryToBeforeButDstNonExist = arr.filter(item => item.before !== undefined && !arr.find(innerItem => innerItem.id === item.before))
  const tryToAfterButDstNonExist = arr.filter(item => item.after !== undefined && !arr.find(innerItem => innerItem.id === item.after))
  if (tryToBeforeButDstNonExist.length > 0) {
    genErr(tryToBeforeButDstNonExist.map(item => `错误：${item.id}试图排到${item.before}之前，但${item.before}不存在`).join('\n'))
  }
  if (tryToAfterButDstNonExist.length > 0) {
    genErr(tryToAfterButDstNonExist.map(item => `错误：${item.id}试图排到${item.after}之后，但${item.after}不存在`).join('\n'))
  }

  const tryToBeforeButDstAlso = arr.filter(item => 
    item.before !== undefined && 
    arr.find(innerItem => 
      innerItem.id === item.before &&
      innerItem.before === item.id
    )
  )
  // TODO: 这种情况通常会报两条类似的错误，比较重复
  if (tryToBeforeButDstAlso.length > 0) {
    genErr(tryToBeforeButDstAlso.map(item => `错误：${item.id}试图排到${item.before}之前，但${item.before}也试图排到${item.id}之前`))
  }

  const tryToAfterButDstAlso = arr.filter(item => 
    item.after !== undefined && 
    arr.find(innerItem => 
      innerItem.id === item.after &&
      innerItem.after === item.id
    )
  )
  if (tryToAfterButDstAlso.length > 0) {
    genErr(tryToAfterButDstAlso.map(item => `错误：${item.id}试图排到${item.after}之后，但${item.after}也试图排到${item.id}之后`))
  }
  // TODO: id保证唯一
  // TODO: after和before只能有一个
  const resArr = [
    arr.find(item => item.first),
    arr.find(item => item.last)
  ]
  arr.filter(o => o.first === undefined && o.last === undefined).forEach(item => {
    if (item.before === undefined && item.after === undefined) {
      const tryToBeforeItems = resArr.filter(innerItem => innerItem.before === item.id)
      const tryToBeforeItemsMaxIndex = Math.max(tryToBeforeItems.map(item => resArr.indexOf(item)))
      const tryToAfterItems = resArr.filter(innerItem => innerItem.after === item.id)
      const tryToAfterItemsMinIndex = Math.max(tryToAfterItems.map(item => resArr.indexOf(item)))
      if (tryToBeforeItems.length === 0 && tryToAfterItems.length === 0) {
        resArr.splice(1, 0, item)
      } else if (tryToBeforeItems.length === 0) {
        resArr.splice(tryToAfterItemsMinIndex, 0, item)
      } else if (tryToAfterItems.length === 0) {
        resArr.splice(tryToBeforeItemsMaxIndex + 1, 0, item)
      } else {
        if (tryToBeforeItemsMaxIndex <= tryToAfterItemsMinIndex) {
          genErr(`找不到${item.id}的位置`)
        } else {
          resArr.splice(tryToBeforeItemsMaxIndex + 1, 0, item)
        }
      }
    }
    if (item.before !== undefined) {
      const dst = resArr.find(innerItem => innerItem.id === item.before)
      if (dst) {
        resArr.splice(resArr.indexOf(dst), 0, item)
      } else {
        resArr.splice(1, 0, item)
      }
    }
    if (item.after !== undefined) {
      const dst = resArr.find(innerItem => innerItem.id === item.after)
      if (dst) {
        resArr.splice(resArr.indexOf(dst) + 1, 0, item)
      } else {
        resArr.splice(1, 0, item)
      }
    }
  })
  console.log(resArr)
  return arr
}
getOrderedLinkList([
  {id: 1},
  {id: 2, before: 1}, // 这里 before 的意思是自己要排在 id 为 1 的元素前面
  {id: 3, after: 1},  // 这里 after 的意思是自己要排在 id 为 1 元素后面 
  {id: 5, first: true},
  {id: 6, last: true},
  {id: 7, after: 8}, // 这里 after 的意思是自己要排在 id 为 8 元素后面
  {id: 8},
  {id: 9},
])