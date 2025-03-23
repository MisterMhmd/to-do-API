const expressjs = require('express');
const fs = require('fs');
const app = expressjs();
const port = process.env.port; //port from the .env file

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

//get for displaying all tasks
app.get("/tasks", (req, res) => {
    res.setHeader("content-type", "application/json");
    res.send(tasks)
});

//get for only displaying tasks based on the id
app.get("/tasks/:id", (req, res) => {
    const id = tasks.find(c => c.id === parseInt(req.params.id));
    if (!id){
        res.status(404).send("ID not found!")
    } else {
        res.send(id);
    }
})

//post for adding tasks
app.post("/tasks", (req, res) => {
    if (!req.body.name) {
        res.status(400).send("No name input found! try again!");
        return;
        }

    const body = {
        id: tasks.length + 1,
        task_status: "pending",
        name: req.body.name
    }

    tasks.push(body);
    
    fs.writeFile("./tasks.json", JSON.stringify(tasks, null, 2), (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "Could not save task"})
        } else {
            console.log("tasks added successfully!");
            res.statusCode = 201;
            res.write(JSON.stringify(body));
            res.end();
        }
    });
});


//put for updating the status of the task
app.put("/tasks/:id", (req, res) => {
    const id = tasks.find(c => c.id === parseInt(req.params.id));
    if (!id){
        res.status(404).send("ID not found!")
    } else if (req.body.task_status === "completed") { //if the tasks are marked as completed, update
        id.task_status = "completed";
    
        fs.writeFile("./tasks.json", JSON.stringify(tasks, null, 2), (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({ error: "Could not update task"})
            } else {
                console.log("Task updated successfully!");
                res.statusCode = 201;
                res.send(id);
                res.end();
            }
        });
    } else {
        res.send("invalid input! Try again");
    }
});



//delete for deleting a task based on its id
app.delete("/tasks/:id", (req, res) => {
    const id = tasks.find(c => c.id === parseInt(req.params.id));
    if (!id){
        res.status(404).send("ID not found!")
    } else {
        const index = tasks.indexOf(id);
        tasks.splice(index, 1);

        tasks.forEach((tasks, i) => { //rearrange the ids of the tasks after deleting a task
            tasks.id = i + 1;
        });

        //updating changes to the json file
        fs.writeFile("./tasks.json", JSON.stringify(tasks, null, 2), (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({ error: "Could not update task"})
            } else {
                console.log("Tasks updated successfully!");
                res.statusCode = 201;
                res.send(id);
                res.end();
            }
        });
    }
})


//server
app.listen(port, () => {
    console.log(`listening at port ${port}`);
});