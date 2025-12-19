import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function CustomDropdown({ options, value, onChange, placeholder, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        onChange({ target: { name: '', value: optionValue } }); // Mock event for compatibility
        setIsOpen(false);
    };

    return (
        <div className={`custom-dropdown ${className} ${isOpen ? 'active' : ''}`} ref={dropdownRef}>
            <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={`trigger-text ${!selectedOption ? 'placeholder-text' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiChevronDown className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} />
            </button>

            {isOpen && (
                <ul className="dropdown-menu" role="listbox">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className={`dropdown-item ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                            role="option"
                            aria-selected={option.value === value}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
