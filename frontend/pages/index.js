/**
 * Important imports
 */
import Head from "next/head";
import { Input, Button, Form, message } from "antd";
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

/**
 * Home (Login) Page
 * @returns
 */
export default function Home() {
    // Use states
    const [loading, setLoading] = useState(false);

    // To navigate
    const router = useRouter();

    // On Form Submit
    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Send post request to validate credentials
            const response = await axios.post("http://localhost:8000/login", {
                email: values.email,
                password: values.password,
            });

            // User verified
            if (response.status === 200) {
                message.success("Login successful");
                Cookies.set("access_token", response.data.token, {
                    expires: 1 / 24,
                });
                router.push("/chat?username=" + response.data.username);
            }
        } catch (error) {
            console.error("An error occurred:", error);

            // Show message to user containing the error
            if (error.response && error.response.data) {
                message.error(error.response.data.message);
            } else {
                message.error("An error occurred. Please try again later.");
            }
        }
        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>Login Page</title>
                <meta name="description" content="Login Page" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.container}>
                <div className={styles.card}>
                    <h1>Login</h1>
                    <Form name="login-form" onFinish={onFinish}>
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your email!",
                                },
                                {
                                    type: "email",
                                    message:
                                        "Please enter a valid email address!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Email"
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your password!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                                iconRender={(visible) =>
                                    visible ? (
                                        <EyeTwoTone />
                                    ) : (
                                        <EyeInvisibleOutlined />
                                    )
                                }
                            />
                        </Form.Item>
                        <Form.Item>
                            <div className={styles.buttons}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    Login
                                </Button>
                                <Link href="/register">
                                    Register New Account
                                </Link>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </main>
        </>
    );
}
