import React from 'react';

const Footer = () => {
    return (
        <div className='footer bg-red-800 py-5 flex flex-row justify-center'>
            <div className='flex-none text-center'>
                <h2 className='text-white text-[20px]'>About</h2>
                <div className='text-left'>
                    <a href="https://team3647.wixsite.com/falcons" className='text-blue-500 underline hover:text-blue-600'>Team 3647</a>
                    <a> . </a>
                    <a href="/footer/about" className='text-blue-500 underline hover:text-blue-600'>About</a>
                    <a> . </a>
                    <a href="/footer/Terms" className='text-blue-500 underline hover:text-blue-600'>Terms</a>
                    <a> . </a>
                    <a href="/footer/privacy" className='text-blue-500 underline hover:text-blue-600'>Privacy</a>
                    <a> . </a>
                    <a href="/footer/FAQ" className='text-blue-500 underline hover:text-blue-600'>FAQs</a>
                    <a> . </a>
                    <a href="/footer/Help" className='text-blue-500 underline hover:text-blue-600'>Help</a>
                    <a> . </a>

                </div>
            </div>
        </div>
    );
};

export default Footer;