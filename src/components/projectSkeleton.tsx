"use client";

interface ProjectSkeletonProps {
    count?: number;
}

const ProjectSkeleton = ({ count = 4 }: ProjectSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="animate-pulse bg-[#090d16]/20 border border-green-500/5 rounded-xl h-[380px] flex flex-col justify-between p-1"
                >
                    <div className="w-full aspect-video bg-gray-900/60 rounded-t-lg"></div>

                    <div className="p-6 flex-1 space-y-4">
                        <div className="h-5 bg-gray-900/80 rounded w-2/3"></div>
                        <div className="flex gap-2">
                            <div className="h-4 bg-gray-900/50 rounded w-12"></div>
                            <div className="h-4 bg-gray-900/50 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default ProjectSkeleton;
