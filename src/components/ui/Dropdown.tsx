import React, { useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface DropdownProps {
    placeholder?: string;
    className?: string;
    showIcon?: boolean;
    selfContent?: React.ReactNode;
    children: React.ReactNode;
    childrenClassName?: string;
    isOpened: boolean;
    setIsOpened: (isOpened: boolean) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
    placeholder = 'Click...',
    className = '',
    showIcon = true,
    selfContent = false,
    children,
    childrenClassName = '',
    isOpened = false,
    setIsOpened = () => {}
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpened(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpened]);

    return (
        <div 
            ref={dropdownRef}
            className={'relative w-full'}
        >
            <button
                type="button"
                onClick={() => setIsOpened(!isOpened)}
                className={twMerge(
                    "w-full px-4 py-2 text-left bg-white",
                    "rounded-md shadow-xs text-sm",
                    className
                )}
            >
                {selfContent ? selfContent : placeholder}
                {showIcon && (
                    <span className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform ${isOpened ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                )}
            </button>

            {isOpened && (
                <div className={twMerge(
                    "absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto",
                    childrenClassName
                )}>
                    {children}
                </div>
            )}
        </div>
    );
}; 