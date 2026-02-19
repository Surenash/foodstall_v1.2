import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// import theme from '../styles/theme'; // Removed
import { useTheme } from '../context/ThemeContext'; // Import Context
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslationSync } from '../services/translations';

/**
 * UserProfile Screen
 * Customer profile management with preferences
 */
const UserProfile = ({ navigation }) => {
    const { theme } = useTheme(); // Use Context
    const [isEditing, setIsEditing] = useState(false);
    const [t, setT] = useState({});

    React.useEffect(() => {
        const loadTranslations = async () => {
            const lang = await AsyncStorage.getItem('language') || 'en';
            setT({
                editProfile: getTranslationSync('editProfile', lang),
                saveChanges: 'Save Changes', // Add to translations if needed
                personalInfo: 'Personal Information', // Add to translations
                dietaryPrefs: 'Dietary Preferences', // Add to translations
                favCuisines: 'Favorite Cuisines', // Add to translations
                myActivity: 'My Activity', // Add to translations
                favStalls: 'Favorite Stalls', // Add to translations
                myReviews: getTranslationSync('myReviews', lang),
                notifications: getTranslationSync('notifications', lang),
                settings: getTranslationSync('settings', lang),
                logout: getTranslationSync('logout', lang),
                cancel: 'Cancel',
                logoutConfirm: 'Are you sure you want to logout?',
                fullName: 'Full Name',
                email: 'Email',
                phone: 'Phone',
            });
        };
        loadTranslations();
    }, []);

    // User data state
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@example.com');
    const [phone, setPhone] = useState('+91 98765 43210');
    const [profileImage, setProfileImage] = useState(null);

    // Dietary preferences
    const [dietaryPrefs, setDietaryPrefs] = useState(['Vegetarian']);
    const dietaryOptions = ['Vegetarian', 'Vegan', 'Non-Veg', 'Halal', 'Jain', 'Gluten-Free'];

    // Favorite cuisines
    const [favCuisines, setFavCuisines] = useState(['South Indian', 'Chinese']);
    const cuisineOptions = ['South Indian', 'North Indian', 'Chinese', 'Street Food', 'Biryani', 'Chaat', 'Fast Food'];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const togglePreference = (pref, list, setList) => {
        if (list.includes(pref)) {
            setList(list.filter(p => p !== pref));
        } else {
            setList([...list, pref]);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        Alert.alert('Saved!', 'Your profile has been updated.');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => navigation.replace('LoginScreen') }
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Profile Header */}
            <View style={[styles.profileHeader, { backgroundColor: theme.colors.primary }]}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={[styles.avatar, { borderColor: 'white' }]} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.surface, borderColor: 'white' }]}>
                            <Icon name="person" size={50} color={theme.colors.textSecondary} />
                        </View>
                    )}
                    <View style={[styles.editAvatarBtn, { backgroundColor: theme.colors.secondary }]}>
                        <Icon name="camera-alt" size={16} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userEmail}>{email}</Text>
            </View>

            {/* Edit Toggle */}
            <TouchableOpacity
                style={[styles.editToggle, { backgroundColor: theme.colors.surface }]}
                onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            >
                <Icon name={isEditing ? 'check' : 'edit'} size={20} color={theme.colors.primary} />
                <Text style={[styles.editToggleText, { color: theme.colors.primary }]}>{isEditing ? t.saveChanges : t.editProfile}</Text>
            </TouchableOpacity>

            {/* Personal Info */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t.personalInfo || 'Personal Information'}</Text>

                <View style={styles.field}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t.fullName || 'Full Name'}</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border },
                            !isEditing && { backgroundColor: theme.colors.background, color: theme.colors.textSecondary }
                        ]}
                        value={name}
                        onChangeText={setName}
                        editable={isEditing}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t.email || 'Email'}</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border },
                            !isEditing && { backgroundColor: theme.colors.background, color: theme.colors.textSecondary }
                        ]}
                        value={email}
                        onChangeText={setEmail}
                        editable={isEditing}
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{t.phone || 'Phone'}</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border },
                            !isEditing && { backgroundColor: theme.colors.background, color: theme.colors.textSecondary }
                        ]}
                        value={phone}
                        onChangeText={setPhone}
                        editable={isEditing}
                        keyboardType="phone-pad"
                    />
                </View>
            </View>

            {/* Dietary Preferences */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t.dietaryPrefs || 'Dietary Preferences'}</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>We'll highlight stalls matching your diet</Text>
                <View style={styles.tagsContainer}>
                    {dietaryOptions.map((diet) => (
                        <TouchableOpacity
                            key={diet}
                            style={[
                                styles.tag,
                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                dietaryPrefs.includes(diet) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => togglePreference(diet, dietaryPrefs, setDietaryPrefs)}
                        >
                            <Text style={[
                                styles.tagText,
                                { color: theme.colors.textSecondary },
                                dietaryPrefs.includes(diet) && { color: theme.colors.textLight }
                            ]}>
                                {diet}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Favorite Cuisines */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t.favCuisines || 'Favorite Cuisines'}</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Get notified about new stalls in these cuisines</Text>
                <View style={styles.tagsContainer}>
                    {cuisineOptions.map((cuisine) => (
                        <TouchableOpacity
                            key={cuisine}
                            style={[
                                styles.tag,
                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                favCuisines.includes(cuisine) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}
                            onPress={() => togglePreference(cuisine, favCuisines, setFavCuisines)}
                        >
                            <Text style={[
                                styles.tagText,
                                { color: theme.colors.textSecondary },
                                favCuisines.includes(cuisine) && { color: theme.colors.textLight }
                            ]}>
                                {cuisine}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Quick Links */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t.myActivity || 'My Activity'}</Text>

                <TouchableOpacity
                    style={[styles.linkRow, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Icon name="favorite" size={24} color={theme.colors.error} />
                    <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>{t.favStalls || 'Favorite Stalls'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.linkRow, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('MyReviews')}
                >
                    <Icon name="rate-review" size={24} color={theme.colors.secondary} />
                    <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>{t.myReviews || 'My Reviews'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.linkRow, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Icon name="notifications" size={24} color={theme.colors.warning || '#FFA000'} />
                    <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>{t.notifications || 'Notifications'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.linkRow, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Icon name="settings" size={24} color={theme.colors.primary} />
                    <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>{t.settings || 'Settings'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
                onPress={handleLogout}
            >
                <Icon name="logout" size={20} color={theme.colors.error} />
                <Text style={[styles.logoutText, { color: theme.colors.error }]}>{t.logout || 'Logout'}</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: theme.colors.background, // Dynamic
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32, // theme.spacing.xl
        // backgroundColor: theme.colors.primary, // Dynamic
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        // borderColor: 'white', // In component
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        // backgroundColor: theme.colors.surface, // Dynamic
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        // borderColor: 'white', // In component
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        // backgroundColor: theme.colors.secondary, // Dynamic
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24, // theme.typography.fontSize['2xl']
        fontWeight: 'bold',
        color: 'white',
        marginTop: 16, // theme.spacing.md
    },
    userEmail: {
        fontSize: 14, // theme.typography.fontSize.sm
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16, // theme.spacing.md
        // backgroundColor: theme.colors.surface, // Dynamic
        marginHorizontal: 16, // theme.spacing.md
        marginTop: -20,
        borderRadius: 8, // theme.borderRadius.md
        // ...theme.shadows.md,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        gap: 8, // theme.spacing.sm
    },
    editToggleText: {
        fontSize: 16, // theme.typography.fontSize.base
        // color: theme.colors.primary, // Dynamic
        fontWeight: '600',
    },
    section: {
        padding: 16, // theme.spacing.md
        marginTop: 16, // theme.spacing.md
    },
    sectionTitle: {
        fontSize: 18, // theme.typography.fontSize.lg
        fontWeight: 'bold',
        // color: theme.colors.textPrimary, // Dynamic
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14, // theme.typography.fontSize.sm
        // color: theme.colors.textSecondary, // Dynamic
        marginBottom: 16, // theme.spacing.md
    },
    field: {
        marginBottom: 16, // theme.spacing.md
    },
    fieldLabel: {
        fontSize: 14, // theme.typography.fontSize.sm
        // color: theme.colors.textSecondary, // Dynamic
        marginBottom: 4,
    },
    input: {
        // backgroundColor: theme.colors.surface, // Dynamic
        borderRadius: 8, // theme.borderRadius.md
        padding: 16, // theme.spacing.md
        fontSize: 16, // theme.typography.fontSize.base
        // color: theme.colors.textPrimary, // Dynamic
        borderWidth: 1,
        // borderColor: theme.colors.border, // Dynamic
    },
    // inputDisabled handled dynamically
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // theme.spacing.sm
    },
    tag: {
        paddingHorizontal: 16, // theme.spacing.md
        paddingVertical: 8, // theme.spacing.sm
        borderRadius: 20,
        // backgroundColor: theme.colors.surface, // Dynamic
        borderWidth: 1,
        // borderColor: theme.colors.border, // Dynamic
    },
    // tagActive handled dynamically
    tagText: {
        fontSize: 14, // theme.typography.fontSize.sm
        // color: theme.colors.textSecondary, // Dynamic
    },
    // tagTextActive handled dynamically
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: theme.colors.surface, // Dynamic
        padding: 16, // theme.spacing.md
        borderRadius: 8, // theme.borderRadius.md
        marginBottom: 8, // theme.spacing.sm
        // ...theme.shadows.sm,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    linkText: {
        flex: 1,
        fontSize: 16, // theme.typography.fontSize.base
        // color: theme.colors.textPrimary, // Dynamic
        marginLeft: 16, // theme.spacing.md
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16, // theme.spacing.md
        marginTop: 24, // theme.spacing.lg
        padding: 16, // theme.spacing.md
        borderRadius: 8, // theme.borderRadius.md
        borderWidth: 1,
        // borderColor: theme.colors.error, // Dynamic (actually keep error color logic in component or constant if easy)
        // keeping logic in component for consistency
        gap: 8, // theme.spacing.sm
    },
    logoutText: {
        fontSize: 16, // theme.typography.fontSize.base
        // color: theme.colors.error, // Dynamic
        fontWeight: '600',
    },
});

export default UserProfile;
