import { createServer } from "http";
const port = 4040;

const tasks = [
    {id: 1, task_status: "completed", name:"task1"},
    {id: 2, task_status: "completed", name:"task2"},
    {id: 3, task_status: "pending", name:"task3"},
    {id: 4, task_status: "pending", name:"task4"}
]

const getUserByIdHandler = (req, res) => {
    const id = req.url.split('/')[3];
    const task = tasks.find((task) => task.id === parseInt(id));
  
    if (task) {
      res.write(JSON.stringify(task));
    } else {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: 'User not found' }));
    }
    res.end();
};


const getUsersHandler = (req, res) => {
    res.write(JSON.stringify(tasks));
    res.end();
};

const jsonMiddleware = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  };

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};


const notFoundHandler = (req, res) => {
    res.statusCode = 404;
    res.write(JSON.stringify({ message: 'Not Found' }));
    res.end();
};



const createUserHandler = (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
        const newUser = JSON.parse(body)
        tasks.push(newUser);
        res.statusCode = 201;
        res.write(JSON.stringify(newUser));
        res.end();
    });
};


const server = createServer((req, res) => {
    logger(req, res, () => {
      jsonMiddleware(req, res, () => {
        if (req.url === '/tasks' && req.method === 'GET') {
          getUsersHandler(req, res);
        } else if (
          req.url.match(/\/tasks\/id\/([0-9]+)/) &&
          req.method === 'GET'
        ) {
          getUserByIdHandler(req, res);
        } else if (req.url === '/tasks' && req.method === 'POST') {
          createUserHandler(req, res);
        } else {
          notFoundHandler(req, res);
        }
      });
    });
  });
  

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});