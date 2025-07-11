require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Mongoose Schema & Model
const taskSchema = new mongoose.Schema({
  task: String,
  priority: {
    type: String,
    enum: ["Urgent", "High", "Low"],
  },
});
const Task = mongoose.model("Task", taskSchema);

// Sample Tasks
const sampleTasks = [
  { task: "Create Some Videos", priority: "High" },
  { task: "Learn DSA", priority: "Urgent" },
  { task: "Learn React", priority: "High" },
  { task: "Take Some Risks", priority: "Low" },
];

// Connect to MongoDB and Insert Sample Data
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany(sampleTasks);
      console.log("📥 Sample tasks inserted.");
    }

    // Start server only after DB connection
    app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Error:", err);
  });

// Routes

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
  } catch (error) {
    res.status(500).send("Error adding task.");
  }
});

app.post("/edit", async (req, res) => {
  const { id, newTask } = req.body;
  if (!newTask.trim()) return res.redirect("/?alert=empty");

  try {
    await Task.findByIdAndUpdate(id, { task: newTask });
    res.redirect("/?alert=updated");
  } catch (error) {
    res.status(500).send("Error updating task.");
  }
});

app.post("/delete", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.body.id);
    res.redirect("/?alert=deleted");
  } catch (error) {
    res.status(500).send("Error deleting task.");
  }
});
