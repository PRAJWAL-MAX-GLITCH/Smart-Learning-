import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-50 overflow-x-hidden">
            <Navbar />
            <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-8">
                {children}
            </main>
            <footer className="w-full bg-white border-t border-gray-100 py-8 mt-auto">
                <div className="w-full px-8 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} AI Smart Learning Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
