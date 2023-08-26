import Head from "next/head";
import { Input, Button, Form, message } from "antd";
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import Link from "next/link";
import styles from "@/styles/Register.module.css";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Register() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFinish = async (values) => {
        try {
            setLoading(true);

            if(values.password != values.confirmpassword){
              message.error('Passwords do not match');
              return;
            }

            const response = await axios.post("http://localhost:8000/register", {
                username: values.username,
                email: values.email,
                password: values.password,
            });

            if (response.status === 201) {
                message.success("Register successful");
                router.push("/");
            }
        } catch (error) {
            console.error("An error occurred:", error);
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
                <title>Register Page</title>
                <meta name="description" content="Register account Page" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.container}>
                <div className={styles.card}>
                    <h1>Register</h1>

                    <Form name="register-form" onFinish={onFinish}>
                        <Form.Item
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your username!",
                                }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Username"
                            />
                        </Form.Item>
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
                        <Form.Item
                            name="confirmpassword"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your password!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm Password"
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
                                    Register
                                </Button>
                                <Link href="/">
                                    Already have an account?
                                </Link>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </main>
        </>
    );
}
