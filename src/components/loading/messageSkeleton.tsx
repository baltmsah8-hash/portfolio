"use client";

import React from "react";

const MessagesSkeleton = () => {
    return (
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-hidden bg-[#02040a]/10 animate-pulse">
            <div className="flex flex-col items-start space-y-2 w-full">
                <div className="w-16 h-2.5 bg-gray-800 rounded-full mx-1" />
                <div className="w-[65%] sm:w-[45%] h-12 bg-[#070a13]/60 border border-green-500/5 rounded-2xl rounded-bl-none" />
            </div>
            <div className="flex flex-col items-end space-y-2 w-full">
                <div className="w-20 h-2.5 bg-gray-800 rounded-full mx-1" />
                <div className="w-[55%] sm:w-[35%] h-14 bg-green-500/10 border border-green-500/10 rounded-2xl rounded-br-none" />
            </div>
            <div className="flex flex-col items-start space-y-2 w-full">
                <div className="w-24 h-2.5 bg-gray-800 rounded-full mx-1" />
                <div className="w-[75%] sm:w-[50%] h-12 bg-[#070a13]/60 border border-green-500/5 rounded-2xl rounded-bl-none" />
            </div>
            <div className="flex flex-col items-end space-y-2 w-full">
                <div className="w-14 h-2.5 bg-gray-800 rounded-full mx-1" />
                <div className="w-[45%] sm:w-[30%] h-12 bg-green-500/10 border border-green-500/10 rounded-2xl rounded-br-none" />
            </div>
        </div>
    );
};

export default MessagesSkeleton;