const expressjs = require('express');
const uuid4 = require('uuid');
const fs = require('fs');
const app = expressjs();
const PORT = process.env.PORT; //port from the .env file

app.use(expressjs.json());


//reading the file at the start of the program
let tasks = [];

fs.readFile('./tasks.json', 'utf-8', (err, jsonstring) => {
    if (err) {
        console.log(err);
    } else {
        tasks =  JSON.parse(jsonstring);
    }
})

const WriteFile = (task, res) => {
    fs.writeFile("./tasks.json", JSON.stringify(tasks, null, 2), (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "Could not save task"})
        } else {
            console.log("Operation Successful!");
        }
    });
}

//get for displaying all tasks
app.get("/tasks", (req, res) => {
    res.setHeader("content-type", "application/json");
    res.send(tasks)
});

//get for only displaying tasks based on the id
app.get("/tasks/:id", (req, res) => {
    const task = tasks.find(task => task.id === parseInt(req.params.id));
    if (!task){
        res.status(404).send("Task not found!")
    } else {
        res.send(task);
    }
})

//post for adding tasks
app.post("/tasks", (req, res) => {
    if (!req.body.name) {
        res.status(400).send("No name input found! try again!");
        return;
        }

    const body = {
        id: uuid4.v4(),
        task_status: "pending",
        name: req.body.name
    }

    tasks.push(body);
    const Jsonbody = JSON.stringify(body);

    WriteFile(Jsonbody, res);
    res.statusCode = 201;
    res.send(body);
    res.end();
});


//put for updating the status of the task
app.put("/tasks/:id", (req, res) => {
    const task = tasks.find(task => task.id === req.params.id);
    if (!task){
        res.status(404).send("Task not found!")
    } else if (req.body.task_status) { //if the tasks are marked as completed, update
        task.task_status = req.body.task_status;
    
        WriteFile(task, res);
        res.statusCode = 201;
        res.send(task);
        res.end();
    } else {
        res.send("invalid input! Try again");
    }
});



//delete for deleting a task based on its id
app.delete("/tasks/:id", (req, res) => {
    const task = tasks.find(task => task.id === req.params.id);
    if (!task){
        res.status(404).send("task not found!")
    } else {
        const index = tasks.indexOf(task);
        tasks.splice(index, 1);

        //updating changes to the json file
        WriteFile(task, res);
        res.statusCode = 201;
        res.send(task);
        res.end();
    }
})


//server
app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`);
});