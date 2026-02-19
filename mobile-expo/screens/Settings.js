import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Linking,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // Import Context
import { getLanguage, setLanguage as saveLanguage, clearAllCache } from '../services/storage';

/**
 * Settings Screen
 * App settings, language, notifications, about
 */
const Settings = ({ navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme(); // Use Context
    const [language, setLanguage] = useState('English');
    const [notifications, setNotifications] = useState(true);
    const [locationAlerts, setLocationAlerts] = useState(true);

    const languages = ['English', 'हिंदी', 'தமிழ்', 'मराठी'];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        // Dark mode is now handled by Context, no need to load it manually here
        const savedLanguage = await getLanguage();
        if (savedLanguage) {
            const langMap = { 'en': 'English', 'hi': 'हिंदी', 'ta': 'தமிழ்', 'mr': 'मराठी' };
            setLanguage(langMap[savedLanguage] || 'English');
        }
    };

    const handleLanguageChange = async (lang) => {
        setLanguage(lang);
        const langCodeMap = { 'English': 'en', 'हिंदी': 'hi', 'தமிழ்': 'ta', 'मराठी': 'mr' };
        await saveLanguage(langCodeMap[lang]);
    };

    // handleDarkModeToggle is replaced by toggleTheme from context

    const showLanguagePicker = () => {
        Alert.alert(
            'Select Language',
            'Choose your preferred language',
            languages.map(lang => ({
                text: lang,
                onPress: () => handleLanguageChange(lang),
            }))
        );
    };

    const clearCache = async () => {
        Alert.alert(
            'Clear Cache',
            'This will clear cached images and search history. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllCache();
                        Alert.alert('Done', 'Cache cleared successfully!');
                    }
                }
            ]
        );
    };

    const SettingRow = ({ icon, iconColor, title, subtitle, onPress, rightComponent }) => (
        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surface }]} onPress={onPress} disabled={!onPress}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Icon name={icon} size={22} color={iconColor} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
                {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
            </View>
            {rightComponent || (onPress && <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />)}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Language Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Language & Region</Text>
                <SettingRow
                    icon="language"
                    iconColor={theme.colors.primary}
                    title="Language"
                    subtitle={language}
                    onPress={showLanguagePicker}
                />
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Notifications</Text>
                <SettingRow
                    icon="notifications"
                    iconColor={theme.colors.secondary}
                    title="Push Notifications"
                    subtitle="Get updates about stalls and offers"
                    rightComponent={
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    }
                />
                <SettingRow
                    icon="location-on"
                    iconColor={theme.colors.success}
                    title="Nearby Stall Alerts"
                    subtitle="Get notified when you're near a favorite stall"
                    rightComponent={
                        <Switch
                            value={locationAlerts}
                            onValueChange={setLocationAlerts}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    }
                />
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Appearance</Text>
                <SettingRow
                    icon="dark-mode"
                    iconColor="#6B7280"
                    title="Dark Mode"
                    subtitle={isDarkMode ? 'Enabled' : 'Disabled'}
                    rightComponent={
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    }
                />
            </View>

            {/* Data Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Data & Storage</Text>
                <SettingRow
                    icon="delete-sweep"
                    iconColor={theme.colors.error}
                    title="Clear Cache"
                    subtitle="Free up storage space"
                    onPress={clearCache}
                />
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>About</Text>
                <SettingRow
                    icon="info"
                    iconColor={theme.colors.primary}
                    title="App Version"
                    subtitle="1.0.0"
                />
                <SettingRow
                    icon="description"
                    iconColor="#8B5CF6"
                    title="Terms of Service"
                    onPress={() => Linking.openURL('https://example.com/terms')}
                />
                <SettingRow
                    icon="privacy-tip"
                    iconColor="#EC4899"
                    title="Privacy Policy"
                    onPress={() => Linking.openURL('https://example.com/privacy')}
                />
                <SettingRow
                    icon="help"
                    iconColor={theme.colors.secondary}
                    title="Help & Support"
                    onPress={() => navigation.navigate('Help')}
                />
                <SettingRow
                    icon="star"
                    iconColor="#F59E0B"
                    title="Rate This App"
                    onPress={() => Alert.alert('Thanks!', 'This would open the app store.')}
                />
            </View>

            {/* Danger Zone */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>Danger Zone</Text>
                <TouchableOpacity
                    style={[styles.dangerBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.error }]}
                    onPress={() => Alert.alert(
                        'Delete Account',
                        'This action is permanent and cannot be undone. All your data will be deleted.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => { } }
                        ]
                    )}
                >
                    <Icon name="delete-forever" size={20} color={theme.colors.error} />
                    <Text style={styles.dangerBtnText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: theme.colors.background, // Handled dynamically
    },
    section: {
        marginTop: 24, // theme.spacing.lg
        paddingHorizontal: 16, // theme.spacing.md
    },
    sectionTitle: {
        fontSize: 14, // theme.typography.fontSize.sm
        fontWeight: '600',
        // color: theme.colors.textSecondary, // Handled dynamically
        marginBottom: 8, // theme.spacing.sm
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: theme.colors.surface, // Handled dynamically
        padding: 16, // theme.spacing.md
        borderRadius: 8, // theme.borderRadius.md
        marginBottom: 8, // theme.spacing.sm
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingContent: {
        flex: 1,
        marginLeft: 16, // theme.spacing.md
    },
    settingTitle: {
        fontSize: 16, // theme.typography.fontSize.base
        fontWeight: '500',
        // color: theme.colors.textPrimary, // Handled dynamically
    },
    settingSubtitle: {
        fontSize: 14, // theme.typography.fontSize.sm
        // color: theme.colors.textSecondary, // Handled dynamically
        marginTop: 2,
    },
    dangerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16, // theme.spacing.md
        // backgroundColor: theme.colors.surface, // Handled dynamically
        borderRadius: 8, // theme.borderRadius.md
        borderWidth: 1,
        // borderColor: theme.colors.error, // Handled dynamically
        gap: 8, // theme.spacing.sm
    },
    dangerBtnText: {
        fontSize: 16, // theme.typography.fontSize.base
        // color: theme.colors.error, // Handled dynamically
        fontWeight: '600',
    },
});

export default Settings;
