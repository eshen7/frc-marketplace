import React from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

export default function PageNotFound() {
    return (
        <>
            <div className='h-screen flex flex-col items-center justify-center'>
                <TopBar />
                <div className="flex-grow flex flex-col items-center justify-center h-screen">
                    <h1 className="text-5xl text-gray-800 font-bold">404</h1>
                    <p className="text-2xl text-gray-600">Page Not Found</p>
                </div>

            </div>
            <Footer />
        </>
    );
}