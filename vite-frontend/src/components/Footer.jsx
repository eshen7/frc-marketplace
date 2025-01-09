import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <div className='footer bg-black py-5 flex flex-row justify-center w-screen'>
            <div className='flex-none text-center'>
                <h2 className='text-white text-[20px]'>About</h2>
                <div className='text-left flex flex-col sm:flex-row sm:gap-4 place-items-center'>
                    <a href="https://team3647.wixsite.com/falcons" target="_blank" className='text-blue-500 underline hover:text-blue-600'>Team 3647</a>
                    <button onClick={() => navigate("/footer/about")} className='text-blue-500 underline hover:text-blue-600'>About</button>
                    <button onClick={() => navigate("/footer/terms")} className='text-blue-500 underline hover:text-blue-600'>Terms</button>
                    <button onClick={() => navigate("/footer/privacy")} className='text-blue-500 underline hover:text-blue-600'>Privacy</button>
                    <button onClick={() => navigate("/footer/FAQ")} className='text-blue-500 underline hover:text-blue-600'>FAQs</button>
                    <button onClick={() => navigate("/footer/ourteam")} className='text-blue-500 underline hover:text-blue-600'>Our Team</button>

                </div>
            </div>

               {/* Social Media Buttons Section */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4">
                <div className="flex gap-6 justify-center">
                    <a href="https://github.com/team3647" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex justify-center items-center rounded-full bg-gray-800 hover:bg-gray-600">
                        <img src="/github-icon.svg" alt="GitHub" className="w-8 h-8" />
                    </a>
                    <a href="https://www.instagram.com/team3647" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex justify-center items-center rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:bg-opacity-80">
                        <img src="/instagram-icon.svg" alt="Instagram" className="w-8 h-8" />
                    </a>
                </div>
            </div>

        </div>
    );
};

export default Footer;