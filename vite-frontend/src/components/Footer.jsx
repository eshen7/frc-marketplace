import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <div className='footer bg-black py-5 flex flex-row justify-center w-screen'>
            <div className='flex-none text-center'>
                <h2 className='text-white text-[20px]'>About</h2>
                <div className='text-left flex flex-row gap-4 place-items-center'>
                    <a href="https://team3647.wixsite.com/falcons" target="_blank" className='text-blue-500 underline hover:text-blue-600'>Team 3647</a>
                    <button onClick={() => navigate("/footer/about")} className='text-blue-500 underline hover:text-blue-600'>About</button>
                    <button onClick={() => navigate("/footer/terms")} className='text-blue-500 underline hover:text-blue-600'>Terms</button>
                    <button onClick={() => navigate("/footer/privacy")} className='text-blue-500 underline hover:text-blue-600'>Privacy</button>
                    <button onClick={() => navigate("/footer/FAQ")} className='text-blue-500 underline hover:text-blue-600'>FAQs</button>
                    <button onClick={() => navigate("/footer/help")} className='text-blue-500 underline hover:text-blue-600'>Help</button>
                    <button onClick={() => navigate("/footer/ourteam")} className='text-blue-500 underline hover:text-blue-600'>
                        Our Team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Footer;