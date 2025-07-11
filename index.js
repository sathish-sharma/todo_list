require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Schema
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

// Insert once if empty
async function insertDefaultTasks() {
  const count = await Task.countDocuments();
  if (count === 0) {
    await Task.insertMany(sampleTasks);
    console.log("📥 Sample tasks inserted.");
  }
}
insertDefaultTasks();

// Routes
app.get("/", async (req, res) => {
  const { priority, alert } = req.query;
  const filter = priority ? { priority } : {};
  const todos = await Task.find(filter);
  res.render("list", { todos, priority, alert });
});

app.post("/add", async (req, res) => {
  const { task, priority } = req.body;
  if (!task.trim()) return res.redirect("/?alert=empty");

  await Task.create({ task, priority });
  res.redirect("/?alert=added");
});

app.post("/edit", async (req, res) => {
  const { id, newTask } = req.body;
  if (!newTask.trim()) return res.redirect("/?alert=empty");

  await Task.findByIdAndUpdate(id, { task: newTask });
  res.redirect("/?alert=updated");
});

app.post("/delete", async (req, res) => {
  await Task.findByIdAndDelete(req.body.id);
  res.redirect("/?alert=deleted");
});

// Start
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
