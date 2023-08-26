/**
 * Important imports
 */
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import styles from "@/styles/Chat.module.css";
import Cookies from "js-cookie";
import io from "socket.io-client";

const inter = Inter({ subsets: ["latin"] });

/**
 * Chat Page
 * @returns
 */
export default function Chat() {

    // To navigate
    const router = useRouter();

    // Get access token from cookies
    const accessToken = Cookies.get("access_token");

    /**
     * Use states
     */
    const [firstTime, setIsFirstTime] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const chatContainerRef = useRef(null);

    // Function to fetch and validate the protected route
    const fetchProtectedRoute = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/protected",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // User is validated
            if (response.status === 200) {
                console.log("User is validated");
            }
        } catch (error) {
            console.error("An error occurred:", error);
            router.push("/");
        }
    };

    /**
     * Use effect to check that the user credentials are correct to enter this page
     */
    useEffect(() => {
        if (firstTime) {
            fetchProtectedRoute();
            setIsFirstTime(false);
        }

        // Validate every 5 minutes
        const intervalId = setInterval(() => {
            fetchProtectedRoute();
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    /**
     * Use effect to scroll down to the latest message if messages hook is changed
     */
    useEffect(() => {
        if (chatContainerRef.current) {
            // Scroll to the bottom of the chat container
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    /**
     * Use effect to connect socket with the backend
     */
    useEffect(() => {
        const newSocket = io("http://localhost:4000", {
            transports: ["websocket", "polling", "flashsocket"],
        });

        setSocket(newSocket);

        // Listen for "chat_history" event and update messages state
        newSocket.on("chat_history", (chatHistory) => {
            setMessages(chatHistory);
        });

        return () => {
            newSocket.disconnect(); // Disconnect when component unmounts
        };
    }, []);

    // Function to handle sending a message
    const sendMessage = () => {
        if (socket) {
            socket.emit("send_message", inputMessage, router.query.username); // Emit the message to the server
            setInputMessage("");
        }
    };

    /**
     * On receiving a new message, update the messages use state
     */
    useEffect(() => {
        if (socket) {
            //Event listener when receiving changes from server to update quill contents
            socket.on("receive_message", (newMessage) => {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            return () => {
                socket.off("receive_message");
            };
        }
    }, [socket]);

    
    return (
        <>
            <Head>
                <title>Chat</title>
                <meta name="description" content="Chat Page" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <div className={styles.titleContainer}>
                    <h1>Chatting App</h1>
                </div>
                <div className={styles.chatContainer}>
                    <div
                        className={styles.messageContainer}
                        ref={chatContainerRef}
                    >
                        {messages.map((message, index) => (
                            <div key={index} className={styles.message}>
                                <div className={styles.username}>
                                    {message.username}
                                </div>
                                <div className={styles.messageText}>
                                    {message.message}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className={styles.messageInput}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
