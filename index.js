const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

// MIDDLEWARES
app.use(express.json());
morgan.token('data', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);
app.use(cors());
app.use(express.static('build'));

// ROUTES
// INFO
app.get('/info', (req, res, next) => {
  Person.find({})
    .then((result) => {
      res.send(`
      <div>
      <h2>Phonebook has info for ${result.length} people</h2>
      <h2>${new Date()}</h2>
      </div>
      `);
    })
    .catch((error) => next(error));
});

// GET ALL
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

// GET ONE
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// DELETE
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// CREATE
app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Name or number missing',
    });
  }

  if (body.number.toString().length < 8) {
    return res.status(400).json({
      error: 'Number has to be atleast 8 characters',
    });
  }

  const person = new Person({
    id: body.id,
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

// UPDATE
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// ERROR HANDLING
const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  if (error.code === 11000) {
    return res
      .status(400)
      .send({ error: "There's already user with this name" });
  }
  if (error.name === 'ValidationError') {
    return res
      .status(400)
      .send({ error: 'Username has to be atleast 3 characters long' });
  }
  next(error);
};

app.use(errorHandler);

// CONNECTION
const PORT = process.env.PORT;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
