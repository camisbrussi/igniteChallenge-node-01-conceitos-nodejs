const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) return response.status(404).json({error: "User not found!"});

  request.username = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some((user) => user.username === username);

  if(userAlreadyExist) {
    return response.status(400).json({error: "User already exists!"})
  }

  const user ={
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const{ username } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  username.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = username.todos.find((todo) => todo.id === id)

  if(!todo) {
    return response.status(404).json({error: "Todo not exists!"})
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.find((todo) => todo.id === id)

  if(!todo) {
    return response.status(404).json({error: "Todo not exists!"})
  }
 
  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.find((todo) => todo.id === id)

  if(!todo) {
    return response.status(404).json({error: "Todo not exists!"})
  }
 
  username.todos.splice(todo, 1);
  return response.status(204).send()
});

module.exports = app;