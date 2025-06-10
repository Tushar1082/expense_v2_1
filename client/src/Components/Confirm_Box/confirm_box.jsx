import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ConfirmBox({ show = false, type, message, onConfirm, show_confirm_modal }) {

    const handleConfirmAction = () => {
        if (onConfirm) onConfirm();
    };

    return (
        <div className={`fixed ${show ? "block" : "hidden"} inset-0 bg-[#000000b5] bg-opacity-50 z-1100 flex items-center justify-center p-4`}>
            <div className="bg-white rounded-lg max-w-md w-full p-6 transform transition-all duration-300 scale-100">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-orange-100 p-2 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Confirm Action
                    </h3>
                </div>

                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex space-x-3 justify-end">
                    <button
                        onClick={() => show_confirm_modal({ show: false, type: "", message: "", onConfirm: null })}
                        className="px-4 py-2 cursor-pointer text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmAction}
                        style={{cursor:'pointer'}}
                        className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${type === 'remove' || type === 'leave'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {type === 'remove' && 'Remove'}
                        {type === 'leave' && 'Leave'}
                        {type === 'makeAdmin' && 'Make Admin'}
                        {type === 'sure' && 'Sure'}

                    </button>
                </div>
            </div>
        </div>
    );
}
