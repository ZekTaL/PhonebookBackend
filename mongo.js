const mongoose = require('mongoose')

// < 3 ARGS -> you need at least 3 args
if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstackdev_user:${password}@fullstackdevcluster.z54hh.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

// 3 ARGS -> List of all people
if (process.argv.length === 3)
{
  Person.find({})
    .then(result => {
      console.log('Phonebook:')
      result.forEach(person => {
        console.log(`${person.name} <> ${person.number}`)
      })
      mongoose.connection.close()
    })
    .catch(error => console.log(error))
  
  return
}

// 4 ARGS -> name or number is missing
if (process.argv.length === 4)
{
  console.log('Please provide name and number! -> node mongo.js <password> <name> <number>')
  process.exit(2)
}

// 5 ARGS -> should be correct with name and number!
if (process.argv.length === 5)
{
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save()
    .then(result => {
      console.log(`Added '${person.name} <> ${person.number}' to the phonebook`)
      mongoose.connection.close()
    })
    .catch(error => console.log(error))
}