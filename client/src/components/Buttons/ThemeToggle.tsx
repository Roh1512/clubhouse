// src/components/ThemeToggle.tsx
import React from "react";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";
import { AiFillSun } from "react-icons/ai";
import { MdDarkMode } from "react-icons/md";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="themeToggleButton">
      {theme === "light" ? <MdDarkMode /> : <AiFillSun />}
    </button>
  );
};

export default ThemeToggle;
