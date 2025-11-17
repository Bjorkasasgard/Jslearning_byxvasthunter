const moment = require('moment')

const mybirthday = '2006-08-08'
const today = moment()
const birthdate = moment(mybirthday)
const duration = moment.duration(today.diff(birthdate))
const years = duration.years()
const months = duration.months()
const days = duration.days()



console.log('Helloww everyoneee!')
console.log(`Today is: ${today.format(`DD MMMM YYYY`)}`)
console.log(`my birth day is: ${birthdate.format(`DD MMMM YYYY`)}`)
console.log(`so, my age is: ${years} years, ${months} month, and ${days} days`)

