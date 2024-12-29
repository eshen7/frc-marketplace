import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    return (
        <div className="h-screen flex flex-col">
            <TopBar />
            <div className="flex flex-col items-center flex-grow justify-center">
                <h1 className="text-4xl pb-20">
                    Your Registration is being processed
                </h1>
                <p>
                    We'll get back to you shortly activating your account.
                </p>

                <p>
                    In the meanwhile, check out the features of our website!
                </p>
            </div>
            <Footer />
        </div>
    );
}

export default LandingPage;