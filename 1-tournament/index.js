const fs = require('fs')
const os = require('os')

const seperator = ';'
const resultMap = {
  win: true,
  loss: true,
  draw: true
}
const createInitialRecord = _ => ({
  MP: 0,
  W: 0,
  D: 0,
  L: 0,
  P: 0
})
const paddingAfterName = 5
const headerName = 'Team'
fs.readFile(`${__dirname}/input`, (err, data) => {
  if (err) throw err
  const str = data.toString('utf-8')
  const rawAllLines = str.split(os.EOL)
  const allLines = rawAllLines.map(line => line.split(seperator))
  const { invalidRawLines, validLines } = allLines.reduce((acc, line, index) => {
    if (line.length !== 3 || !resultMap[line[2]]) {
      acc.invalidRawLines.push(rawAllLines[index])
    } else {
      acc.validLines.push(line)
    }
    return acc
  }, {
    invalidRawLines: [],
    validLines: []
  })

  if (invalidRawLines.length > 0) {
    console.log(`invalid lines:\n${invalidRawLines.join(os.EOL)}`)
  }
  // create result
  const finalResult = validLines.reduce((acc, line) => {
    const firstTeamName = line[0]
    const secondTeamName = line[1]
    const result = line[2]
    const firstTeamObj = acc[firstTeamName] = acc[firstTeamName] || createInitialRecord()
    const secondTeamObj = acc[secondTeamName] = acc[secondTeamName] || createInitialRecord()
    // MP value should always be added, no matter which team
    firstTeamObj.MP++
    secondTeamObj.MP++
    switch (result) {
      case 'draw':
        firstTeamObj.D++
        firstTeamObj.P += 1
        secondTeamObj.D++
        secondTeamObj.P += 1
        break;
      case 'win':
        firstTeamObj.W++
        firstTeamObj.P += 3
        secondTeamObj.L++
        break;
      case 'loss':
        firstTeamObj.L++
        secondTeamObj.W++
        secondTeamObj.P += 3
        break;
    }
    return acc
  }, {})
  const teamNames = Object.keys(finalResult)
  const maxLen = Math.max(...teamNames.map(n => n.length))
  const nameWithPaddingLen = maxLen + paddingAfterName
  let finalLines = Object.keys(finalResult).map(n => 
    `${n}${new Array(nameWithPaddingLen - n.length).fill(' ').join('')}|  ${finalResult[n].MP} |  ${finalResult[n].W} |  ${finalResult[n].D} |  ${finalResult[n].L} |  ${finalResult[n].P}`
  )
  // add header
  finalLines.unshift(
    `${headerName}${new Array(nameWithPaddingLen - headerName.length).fill(' ').join('')}| MP |  W |  D |  L |  P`
  )
  const finalStr = finalLines.join('\n')
  // write file
  const writeData = new Uint8Array(Buffer.from(finalStr))
  fs.writeFile(`${__dirname}/output`, writeData, (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
})
// almost cost 1 hour and half, including being familiar with Node API, thinking the logic and the testing
// the problem itself isn' t that difficult,
// but some details need carefully thinking,
// for example, how to compute the tabs of the results as we should give users better experience

// there are still another cases don't be considered: 
// it is chaos when the num in the output file is larger than 10
// it can be do much better