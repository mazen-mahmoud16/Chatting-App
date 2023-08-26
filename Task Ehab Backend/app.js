/**
 * Important requires
 */
const express = require("express");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cors = require("cors");
const validateToken = require("./authMiddleware");

/**
 * Instantiations
 */
const app = express();
const prisma = new PrismaClient();

/**
 * Middlewares
 */
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define a route to handle GET requests
app.get("/ping", async (req, res) => {
    res.status(201).json({ message: "pong" });
});

/**
 * Regtering new account
 */
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user with the provided email or username already exists
        const existingUser = await prisma.User.findFirst({
            where: {
                OR: [{ email: email }, { username: username }],
            },
        });

        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Username or email already exists" });
        }

        const user = {
            username: username,
            email: email,
            password: hashedPassword,
        };

        const createdUser = await prisma.User.create({
            // Use prisma.user
            data: user,
        });

        res.status(201).json(createdUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("An error occurred.");
    }
});

/**
 * Login using existing account
 */
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ token, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
});

// Define protected routes using the validateToken middleware
app.get("/protected", validateToken, async (req, res) => {
    res.status(200).json({ message: "Access granted to protected route" });
});

// First Parameter is the port needed to run ourcode (Server:4000)
// use cors to allow communication of two different urls (clients,servers)
const socket_io = require("socket.io")(4000, {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
});

socket_io.on("connection", async (socket) => {
    // Join the global room
    socket.join("global");

    // Retrieve chat history from the database
    const chatHistory = await prisma.message.findMany();

    // Send chat history to new user
    socket.emit("chat_history", chatHistory);

    // Broadcast messages to everyone in the global room
    socket.on("send_message", async (message, username) => {
        const newMessage = await prisma.message.create({
            data: {
                username,
                message,
            },
        });
        socket.to("global").emit("receive_message", newMessage);

        socket.emit("receive_message", newMessage);
    });
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
