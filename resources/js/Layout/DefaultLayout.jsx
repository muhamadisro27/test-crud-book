import React, { useState } from "react";
import {
    Layout,
    theme,
    FloatButton,
} from "antd";
const { Header, Footer } = Layout;

const DefaultLayout = ({ children }) => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    
    return (
        <Layout
            style={{
                minHeight: "100vh",
            }}
        >
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                ></Header>
                {children}
                <Footer
                    style={{
                        textAlign: "center",
                    }}
                >
                    Muhamad Isro Sabanur ©{new Date().getFullYear()} All Right
                    Reserved.
                </Footer>
            </Layout>
            <FloatButton.BackTop />
        </Layout>
    );
};

export default DefaultLayout;
