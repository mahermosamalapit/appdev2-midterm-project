const http = require('http');
const fs = require('fs');
const { EventEmitter } = require('events');
const path = require('path');

const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'todos.json');
const LOG_PATH = path.join(__dirname, 'logs.txt');

// Logger using events
const logger = new EventEmitter();
logger.on('log', (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}\n`;
  fs.appendFile(LOG_PATH, logEntry, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
});

// Helper functions
const readTodos = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(data || '[]'));
      } catch (e) {
        reject(e);
      }
    });
  });
};

const writeTodos = (todos) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(DATA_PATH, JSON.stringify(todos, null, 2), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Server creation
const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const [_, route, id] = url.split('/');
  const query = new URL(req.url, `http://${req.headers.host}`).searchParams;

  logger.emit('log', `${method} ${url}`);

  let body = '';
  req.on('data', chunk => (body += chunk));

  req.on('end', async () => {
    try {
      if (route !== 'todos') {
        res.writeHead(404).end('Not Found');
        return;
      }

      let todos = await readTodos();

      // GET /todos or /todos/:id
      if (method === 'GET') {
        if (id) {
          const todo = todos.find(t => t.id == id);
          if (!todo) return res.writeHead(404).end('Todo not found');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(todo));
        } else {
          const filterCompleted = query.get('completed');
          if (filterCompleted !== null) {
            todos = todos.filter(t => t.completed === (filterCompleted === 'true'));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(todos));
        }
      }

      // POST /todos
      if (method === 'POST') {
        const data = JSON.parse(body);
        if (!data.title) return res.writeHead(400).end('Missing title');

        const newTodo = {
          id: todos.length ? todos[todos.length - 1].id + 1 : 1,
          title: data.title,
          completed: data.completed ?? false
        };

        todos.push(newTodo);
        await writeTodos(todos);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newTodo));
      }

      // PUT /todos/:id
      if (method === 'PUT' && id) {
        const index = todos.findIndex(t => t.id == id);
        if (index === -1) return res.writeHead(404).end('Todo not found');
        const updates = JSON.parse(body);
        todos[index] = { ...todos[index], ...updates };
        await writeTodos(todos);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(todos[index]));
      }

      // DELETE /todos/:id
      if (method === 'DELETE' && id) {
        const index = todos.findIndex(t => t.id == id);
        if (index === -1) return res.writeHead(404).end('Todo not found');
        const deleted = todos.splice(index, 1)[0];
        await writeTodos(todos);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(deleted));
      }

      res.writeHead(400).end('Bad Request');
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500).end('Internal Server Error');
    }
  });
});

server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
