import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <div className='footer bg-black py-5 flex flex-row justify-center w-screen'>
            <div className='flex-none text-center'>
                <h2 className='text-white text-[20px]'>About</h2>
                <div className='text-left flex flex-row gap-2 place-items-center'>
                    <a href="https://team3647.wixsite.com/falcons" className='text-blue-500 underline hover:text-blue-600'>Team 3647</a>
                    <a> . </a>
                    <a href="/footer/about" className='text-blue-500 underline hover:text-blue-600'>About</a>
                    <a> . </a>
                    <a href="/footer/terms" className='text-blue-500 underline hover:text-blue-600'>Terms</a>
                    <a> . </a>
                    <a href="/footer/privacy" className='text-blue-500 underline hover:text-blue-600'>Privacy</a>
                    <a> . </a>
                    <a href="/footer/FAQ" className='text-blue-500 underline hover:text-blue-600'>FAQs</a>
                    <a> . </a>
                    <a href="/footer/help" className='text-blue-500 underline hover:text-blue-600'>Help</a>
                    <a> . </a>

                    <button onClick={() => navigate("/ourteam")} className='text-blue-500 underline hover:text-blue-600'>
                        Our team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Footer;