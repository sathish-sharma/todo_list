const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const MONGO_URI = "mongodb+srv://maruthisathish03:Mohana123@project1.v1qksi8.mongodb.net/?retryWrites=true&w=majority&appName=project1";

const taskSchema = new mongoose.Schema({
  task: String,
  priority: {
    type: String,
    enum: ["Urgent", "High", "Low"],
    default: "Low"
  }
});
const Task = mongoose.model("Task", taskSchema);

const sampleTasks = [
  { task: "Create Some Videos", priority: "High" },
  { task: "Learn DSA", priority: "Low" },
  { task: "Learn React", priority: "Low" },
  { task: "Take Some Risks", priority: "High" }
];

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    return Task.countDocuments();
  })
  .then(count => {
    if (count === 0) {
      return Task.insertMany(sampleTasks).then(() => {
        console.log("Sample tasks inserted.");
      });
    }
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

let alertMessage = null;
app.get("/", (req, res) => {
  Task.find()
    .then(tasks => {
      res.render("list", { ejes: tasks, alert: alertMessage });
    })
    .catch(err => res.status(500).send("Error fetching tasks"));
});


app.post("/", async (req, res) => {
  const {ele1,priority} = req.body;
  if (!ele1) 
    return res.status(400).json({ success: false, error: "Task cannot be empty" , alert: "empty"});
  try {
    await Task.create({ task: ele1, priority });
    alertMessage = "added";
    res.status(200).json({ success: true, alert: alertMessage });
  } catch (err) {
         alertMessage = "empty";
        res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/delete", async (req, res) => {
  const taskToDelete = req.body.task;
  try {
    const result = await Task.deleteOne({ task: taskToDelete });
    if (result.deletedCount > 0) {
      alertMessage = "deleted";
      res.status(200).json({ success: true, alert: alertMessage });
    } else {
      res.status(404).json({ success: false, error: "Task not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/edit", async (req, res) => {
  const { oldTask, newTask, newPriority } = req.body;
  const trimmedNew = newTask.trim();
  
  if (!trimmedNew)
     return res.status(400).json({ success: false, error: "New task cannot be empty", alert: "empty" });
  try {
    const result = await Task.findOneAndUpdate(
      { task: oldTask },
      { task: trimmedNew, priority: newPriority },
    );
    if (result) {
      alertMessage = "updated";
      res.status(200).json({ success: true, alert: alertMessage });
    } else {
      alertMessage = "empty";
      res.status(404).json({ success: false, error: "Task not found" , alert: alertMessage });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(8000, () => {
  console.log(`Server started on 8000`);
});
