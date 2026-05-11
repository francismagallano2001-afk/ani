import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MongoDB Configuration ---

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not defined. The application will not be able to connect to the database.");
}

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  role: { type: String, default: "student" },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastActive: { type: Date, default: Date.now }
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  content: String,
  environment: String
});

const quizSchema = new mongoose.Schema({
  question: { type: String, unique: true, required: true },
  options: [String],
  correct_answer: String,
  category: String,
  hint: String
});

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gameType: String,
  score: Number,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Lesson = mongoose.model("Lesson", lessonSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const Score = mongoose.model("Score", scoreSchema);

// Seeding Helper
async function seedData() {
  try {
    const lessonCount = await Lesson.countDocuments();
    if (lessonCount === 0) {
      console.log("Seeding initial lessons...");
      const initialLessons = [
        { title: "Introduction to Mammals", content: "Mammals are warm-blooded animals with fur or hair. They give birth to live young and produce milk. Examples include lions, elephants, and humans!", environment: "Forest" },
        { title: "Reptile Residents", content: "Reptiles are cold-blooded animals with scales. They usually lay eggs on land. Snakes, turtles, and lizards are all reptiles you might find in the forest floor.", environment: "Forest" },
        { title: "The World of Fish", content: "Fish live in water, have scales, and breathe through gills. Most fish lay eggs. Sharks and goldfish are types of fish.", environment: "Ocean" },
        { title: "Deep Sea Wonders", content: "The ocean is home to giants like whales and clever creatures like octopuses. Mammals like dolphins also live here, but they breathe air through blowholes!", environment: "Ocean" },
        { title: "Birds of the Sky", content: "Birds have feathers, wings, and lay eggs. Most birds can fly! Eagles and parrots are famous birds.", environment: "Sky" },
        { title: "Feathery Flight", content: "Birds have hollow bones to help them stay light in the air. Not all birds fly - the penguin and ostrich are birds that prefer the ground and water!", environment: "Sky" },
        { title: "Farm Friends", content: "Farm animals are domestic animals raised for food or work. Cows, pigs, and chickens are common farm animals.", environment: "Farm" },
        { title: "Barnyard Life", content: "Horses help with work, sheep provide wool for clothes, and ducks love the farm pond. Every animal has a special job on the farm!", environment: "Farm" }
      ];
      await Lesson.insertMany(initialLessons);
    }

    const quizCount = await Quiz.countDocuments();
    if (quizCount === 0) {
      console.log("Seeding initial quizzes...");
      const initialQuizzes = [
        { question: "Which animal belongs to the mammal group?", options: ["Snake", "Dog", "Eagle"], correct_answer: "Dog", category: "Mammals", hint: "They are known as man's best friend." },
        { question: "Are mammals warm-blooded or cold-blooded?", options: ["Warm-blooded", "Cold-blooded", "Both"], correct_answer: "Warm-blooded", category: "Mammals", hint: "Humans share this trait with other mammals." },
        { question: "Which mammal is the largest land animal?", options: ["Lion", "Elephant", "Giraffe"], correct_answer: "Elephant", category: "Mammals", hint: "They have long trunks and big ears." },
        { question: "What do fish use to breathe underwater?", options: ["Lungs", "Gills", "Skin"], correct_answer: "Gills", category: "Fish", hint: "It's a specialized organ located on the sides of their heads." },
        { question: "Which of these is a marine mammal, not a fish?", options: ["Shark", "Dolphin", "Tuna"], correct_answer: "Dolphin", category: "Ocean", hint: "They breathe air and give birth to live young." },
        { question: "How many hearts does an octopus have?", options: ["One", "Two", "Three"], correct_answer: "Three", category: "Ocean", hint: "They have more than one to help pump their blue blood." },
        { question: "Which of these animals has feathers?", options: ["Lion", "Shark", "Parrot"], correct_answer: "Parrot", category: "Birds", hint: "This animal is known for its ability to mimic human speech." },
        { question: "Which bird is famous for not being able to fly?", options: ["Eagle", "Owl", "Penguin"], correct_answer: "Penguin", category: "Birds", hint: "They are excellent swimmers in cold waters." },
        { question: "What is the only mammal that can truly fly?", options: ["Flying Squirrel", "Bat", "Eagle"], correct_answer: "Bat", category: "Sky", hint: "They are nocturnal and use echolocation." },
        { question: "Which animal is commonly found on a farm?", options: ["Whale", "Cow", "Tiger"], correct_answer: "Cow", category: "Farm", hint: "This animal provides us with milk." },
        { question: "Which farm animal provides wool for our clothes?", options: ["Pig", "Sheep", "Chicken"], correct_answer: "Sheep", category: "Farm", hint: "They say 'Baa' and have fluffy coats." },
        { question: "What does a rooster do in the morning?", options: ["Sleep", "Crow", "Swim"], correct_answer: "Crow", category: "Farm", hint: "They make a loud 'Cock-a-doodle-doo' sound." }
      ];
      await Quiz.insertMany(initialQuizzes);
    }

    const teacher = await User.findOne({ username: "Teacher" });
    if (!teacher) {
      console.log("Creating default teacher user...");
      await User.create({
        username: "Teacher",
        role: "teacher",
        points: 0,
        level: 1,
        lastActive: new Date()
      });
    }

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
}

async function startServer() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
      await seedData();
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
    }
  }

  const app = express();
  const PORT = 3001; // Note: In this environment, it should probably be 3000, but I'll stick to 3000 as per instructions.
  // Wait, instructions say PORT 3000 is the ONLY accessible port.
  
  app.use(express.json());

  // API Routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      let user = await User.findOne({ username });
      if (!user) {
        user = await User.create({ username });
      }
      res.json({ id: user._id, username: user.username, role: user.role, points: user.points, level: user.level, lastActive: user.lastActive });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: user._id, username: user.username, role: user.role, points: user.points, level: user.level, lastActive: user.lastActive });
    } catch (error) {
      console.error("Fetch user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await Lesson.find();
      res.json(lessons.map(l => ({ id: l._id, title: l.title, content: l.content, environment: l.environment })));
    } catch (error) {
      console.error("Fetch lessons error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await Quiz.find();
      res.json(quizzes.map(q => ({ id: q._id, question: q.question, options: q.options, correct_answer: q.correct_answer, category: q.category, hint: q.hint })));
    } catch (error) {
      console.error("Fetch quizzes error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      const { user_id, game_type, score } = req.body;
      if (!user_id || !game_type || score === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await Score.create({
        userId: user_id,
        gameType: game_type,
        score: score
      });

      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      user.points += score;
      user.level = Math.floor(user.points / 100) + 1;
      user.lastActive = new Date();
      await user.save();
      
      res.json({ success: true, newPoints: user.points, newLevel: user.level });
    } catch (error) {
      console.error("Submit score error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await User.find({ role: "student" })
        .sort({ points: -1 })
        .limit(10);
      res.json(leaderboard.map(u => ({ username: u.username, points: u.points, level: u.level })));
    } catch (error) {
      console.error("Fetch leaderboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ role: "student" });
      const stats = await Score.aggregate([
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
      ]);
      const avgScore = stats.length > 0 ? stats[0].avgScore : 0;

      res.json({ totalUsers, avgScore });
    } catch (error) {
      console.error("Fetch admin stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
      logLevel: 'error',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const FINAL_PORT = 3000;
  app.listen(FINAL_PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${FINAL_PORT}`);
  });
}

startServer();

