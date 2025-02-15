import React from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { DataProvider } from "../contexts/DataContext";
import { CompetitionsProvider } from "../contexts/CompetitionsContext";

const PageNotFound = () => {
    return (
        <DataProvider>
            <CompetitionsProvider>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <TopBar />
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                            <p className="text-xl text-gray-600">Page not found</p>
                        </div>
                    </div>
                    <Footer />
                </div>
            </CompetitionsProvider>
        </DataProvider>
    );
};

export default PageNotFound;