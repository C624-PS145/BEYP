const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// import routes
const profileRoutes = require("../routes/profile");
const experienceRoutes = require("../routes/experience");
const projectRoutes = require("../routes/projects");
const certificationRoutes = require("../routes/certifications");
const educationRoutes = require("../routes/education");
const contactRoutes = require("../routes/contact");
const aboutRoutes = require("../routes/about");
const portfolioContextRoutes = require("../routes/portfolioContext");
const chatRoutes = require("../routes/chat");
const authRoutes = require("../routes/auth");

// register routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/portfolio-context", portfolioContextRoutes);
app.use("/api/chat", chatRoutes);

// test route
app.get("/api", (req, res) => {
  res.send("API berjalan di Vercel sukses!");
});

module.exports = serverless(app);
