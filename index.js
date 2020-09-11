require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
// const { response } = require('express')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('data', function getData (req, res) {
    if (req.method === 'POST')
        return JSON.stringify(req.body)
    else
        return null

})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

// HARDCODED PERSONS
let persons = [
    {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
    },
    {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
    },
    {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
    },
    {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
    }
]


// INDEX PAGE
app.get('/', (req, res) => {
    res.send('<h1>PHONEBOOK INDEX PAGE!</h1>')
})

// INFO PAGE
app.get('/info', (request, response) => {
    Person.countDocuments({})
     .then(result => {
        const infoPage = `Phonebook has info for ${result} people!<p>${new Date}`
        response.send(infoPage)
      })
})
  
// GET ALL PERSONS
app.get('/api/persons', (request, response) => {
    Person.find({})
    .then(result => {
      response.json(result)
      if (result.length > 0)
      {
        console.log('Phonebook:')
        result.forEach(person => {
          console.log(`${person.name} <> ${person.number}`)
        })
      }
      else
      {
        console.log('Phonebook is still empty!')
      }  
    })
    .catch(error => console.log(error))
})

// GET A SINGLE PERSON
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person)
        {
            response.json(person)
        }
        else 
        {        
            response.status(404).end()      
        }        
      })
      .catch(error => next(error))
})

// DELETE 
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))  
})

// POST A PERSON
app.post('/api/persons', (request, response, next) => {
  
    const body = request.body
  
    // check if name or number is null
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing!' 
      })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person
      .save()
      .then(savedPerson => savedPerson.toJSON())
      .then(savedAndFormattedPerson => response.json(savedAndFormattedPerson))
      .catch(error => next(error))
})

// UPDATE PERSON 
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
        name: body.name,
        number: body.number
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

// UNKNOWN ENDPOINT
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// ERROR HANDLERS
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') 
  {   
    return response.status(400).json({ error: error.message })
  }
  
  next(error)
}
  
app.use(errorHandler)

// LISTEN PORT
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})