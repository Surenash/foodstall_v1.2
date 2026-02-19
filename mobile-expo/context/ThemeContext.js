import React, { createContext, useState, useContext, useEffect } from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, typography, spacing, borderRadius, shadows, components } from '../styles/theme';
import { getDarkMode, setDarkMode as saveDarkMode } from '../services/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [theme, setTheme] = useState({
        colors: lightColors,
        typography,
        spacing,
        borderRadius,
        shadows,
        components,
        isDark: false,
    });

    // Load saved theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            const savedMode = await getDarkMode();
            setIsDarkMode(savedMode);
            updateTheme(savedMode);
        };
        loadTheme();
    }, []);

    const updateTheme = (darkMode) => {
        setTheme({
            colors: darkMode ? darkColors : lightColors,
            typography,
            spacing,
            borderRadius,
            shadows,
            components,
            isDark: darkMode,
        });
    };

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        updateTheme(newMode);
        await saveDarkMode(newMode);
    };

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
