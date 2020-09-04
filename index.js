const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

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

// UNKNOWN ENDPOINT
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// INDEX PAGE
app.get('/', (req, res) => {
    res.send('<h1>PHONEBOOK INDEX PAGE!</h1>')
})

// INFO PAGE
app.get('/info', (req, res) => {
    const infoPage = `Phonebook has info for ${persons.length} people!<p>${new Date}`
    res.send(infoPage)
})
  
// GET ALL PERSONS
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

// GET A SINGLE PERSON
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if (person) 
    {    
        response.json(person)  
    } 
    else 
    {    
        response.status(404).end()  
    }
})

// DELETE 
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const personToDelete = persons.find(p => p.id == id)
    if (personToDelete)
    {
        persons = persons.filter(p => p.id !== id)
        response.status(204).end()
    }
    else
    {
        response.status(404).end()
    }
    
})

// POST
app.post('/api/persons', (request, response) => {
    const body = request.body
  
    // check if name or number is null
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing!' 
      })
    }

    // check if name is already in the phonebook
    if (persons.find(p => p.name === body.name))
    {
        return response.status(400).json({
            error: 'name must be unique!'
        })
    }
  
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }
  
    persons = persons.concat(person)
  
    response.json(person)
})

// GENERATE RANDOM ID
const maxID = 1000
const generateId = () => {
    const randomId = Math.floor(Math.random() * Math.floor(maxID))
    return randomId
}

app.use(unknownEndpoint)

// LISTEN PORT
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})