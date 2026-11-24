import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] pt-[120px] px-[20px] pb-[40px]">
            <div className="bg-white p-10 md:p-16 rounded-[32px] shadow-2xl text-center max-w-lg w-full border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
                
                {/* Icon Wrapper */}
                <div className="flex justify-center mb-6">
                    <div className="bg-[#FFF4E5] p-5 rounded-full text-[#8e2420] shadow-inner">
                        <svg 
                            className="w-16 h-16" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2.5} 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                        </svg>
                    </div>
                </div>
                
                {/* Text Content */}
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">
                    Coming Soon
                </h1>
                
                <p className="text-gray-500 mb-8 leading-relaxed text-sm md:text-base font-medium">
                    We're currently in the kitchen cooking up this feature. Our development team is working hard to bring it to you soon!
                </p>
                
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors w-full sm:w-auto"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={() => navigate('/menu')} 
                        className="px-6 py-3.5 bg-[#8e2420] text-white font-bold rounded-xl shadow-lg shadow-red-900/20 hover:bg-[#a8322d] transition-colors w-full sm:w-auto"
                    >
                        View Menu
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ComingSoon;