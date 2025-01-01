import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <div className='footer bg-black py-5 flex flex-row justify-center'>
            <div className='flex-none text-center'>
                <h2 className='text-white text-[20px]'>About</h2>
                <div className='text-left flex flex-col place-items-center'>
                    <a href="https://team3647.wixsite.com/falcons" className='text-blue-500 underline hover:text-blue-600'>Team 3647</a>
                    <button onClick={() => navigate("/ourteam")} className='text-blue-500 underline hover:text-blue-600'>
                        Our team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Footer;