const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


const MONGO_URI = "mongodb+srv://maruthisathish03:Mohana123@project1.v1qksi8.mongodb.net/?retryWrites=true&w=majority&appName=project1";


const taskSchema = new mongoose.Schema({
  task: String,
  priority: {
    type: String,
    enum: ["Urgent", "High", "Low"],
  },
});
const Task = mongoose.model("Task", taskSchema);


const sampleTasks = [
  { task: "Create Some Videos", priority: "High" },
  { task: "Learn DSA", priority: "Urgent" },
  { task: "Learn React", priority: "High" },
  { task: "Take Some Risks", priority: "Low" },
];


mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas");

    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany(sampleTasks);
      console.log("Sample tasks inserted.");
    }

app.listen(3000, () => {
      console.log("Server Started");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


app.get("/", async (req, res) => {
  try {
    const { priority, alert } = req.query;
    const filter = priority ? { priority } : {};
    const todos = await Task.find(filter);
    res.render("list", { todos, priority, alert });
  } catch (error) {
    res.status(500).send("Error loading tasks.");
  }
});

app.post("/add", async (req, res) => {
  const { task, priority } = req.body;
  if (!task.trim()) return res.redirect("/?alert=empty");

  try {
    await Task.create({ task, priority });
    res.redirect("/?alert=added");
  } catch {
    res.status(500).send("Error adding task.");
  }
});


app.post("/delete", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.body.id);
    res.redirect("/?alert=deleted");
  } catch {
    res.status(500).send("Error deleting task.");
  }
});

app.post("/edit", async (req, res) => {
  const { id, newTask } = req.body;
  if (!newTask.trim()) return res.redirect("/?alert=empty");

  try {
    await Task.findByIdAndUpdate(id, { task: newTask });
    res.redirect("/?alert=updated");
  } catch {
    res.status(500).send("Error updating task.");
  }
});