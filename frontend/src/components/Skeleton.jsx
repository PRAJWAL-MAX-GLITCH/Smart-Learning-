import React from 'react';

export const CardSkeleton = () => (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse h-80 flex flex-col justify-between">
        <div>
            <div className="h-6 w-1/4 bg-gray-100 rounded-full mb-4"></div>
            <div className="h-8 w-3/4 bg-gray-100 rounded-lg mb-4"></div>
            <div className="h-4 w-full bg-gray-50 rounded-lg mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-50 rounded-lg"></div>
        </div>
        <div className="h-12 w-full bg-gray-100 rounded-xl"></div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="w-full space-y-4 p-8">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex space-x-4 animate-pulse">
                <div className="h-12 bg-gray-100 rounded-lg flex-grow"></div>
                <div className="h-12 w-24 bg-gray-100 rounded-lg"></div>
                <div className="h-12 w-24 bg-gray-100 rounded-lg"></div>
            </div>
        ))}
    </div>
);
