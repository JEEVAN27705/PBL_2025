import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import '../styles/themes.css'; // Ensure variables are loaded

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
            <style>{`
        .theme-toggle-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .theme-toggle-btn:active {
          transform: translateY(0);
        }

        [data-theme='light'] .theme-toggle-btn {
          background: #ffffff;
          border-color: #e2e8f0;
        }

        [data-theme='dark'] .theme-toggle-btn {
          background: #1e293b;
          border-color: #334155;
        }
      `}</style>
        </button>
    );
}
