"use client";

import React from "react";

const ChatsListSkeleton = () => {
    return (
        <div className="w-full space-y-4 animate-pulse mt-6">
            {[1, 2, 3].map((item) => (
                <div key={item} className="w-full h-24 bg-[#070a13]/30 border border-green-500/5 rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0" />
                        <div className="space-y-2 w-full max-w-md">
                            <div className="h-4 bg-gray-800 rounded-full w-[40%]" />
                            <div className="h-3 bg-gray-800/60 rounded-full w-[60%]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatsListSkeleton;