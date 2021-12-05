function genErr (str) {
  console.error(str)
}

function createTree (arr) {
  let treeObj = {}
  const illegalItems = arr.filter(item => item.parentId !== undefined && !arr.find(innerItem => innerItem.id === item.parentId))
  genErr(illegalItems.map(item => `找不到${item.id}的parent: ${item.parentId}`).join('\n'))
  arr.forEach(item => {
    treeObj[item.id] = item
    treeObj[item.id].children = []
  })
  arr.forEach(item => {
    if (item.parentId !== undefined && treeObj[item.parentId]) {
      treeObj[item.parentId].children.push(item)
    }
  })
  const res = arr.find(item => item.parentId === undefined)
  return res
}
let res = createTree([
  {id:1, name:'i1'},
  {id:2, name:'i2', parentId: 1},
  {id:4, name:'i4', parentId: 3},
  {id:3, name:'i3', parentId: 2},
  {id:8, name:'i8', parentId: 7},
  {id:9, name:'i8', parentId: 10}
])
console.log(res)