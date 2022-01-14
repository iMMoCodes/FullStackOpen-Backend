const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

app.use(express.json());
morgan.token('data', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);
app.use(cors());
app.use(express.static('build'));

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendick',
    number: '39-23-6423122',
  },
];

app.get('/info', (req, res) => {
  res.send(`
    <div>
    <h2>Phonebook has info for ${persons.length} people</h2>
    <h2>${new Date()}</h2>
    </div>
    `);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Name or number missing',
    });
  }

  if (persons.some((e) => e.name === body.name)) {
    return res.status(400).json({
      error: 'Name must be unique',
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  res.json(person);
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
