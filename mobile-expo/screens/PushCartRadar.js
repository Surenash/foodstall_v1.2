import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Switch,
    Platform,
    Alert,
    ScrollView,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslationSync } from '../services/translations';
import theme from '../styles/theme';

const { width } = Dimensions.get('window');

// Mock Data for "Detected" State
// Mock Data for "Detected" State
const INITIAL_VENDOR = {
    id: 'v1',
    name: "Anna's Vegetable Cart",
    description: "Fresh farm vegetables direct to your home",
    image: require('../assets/psuh_cart.png'), // Using local asset
    items: [
        { id: 'potato', price: '₹40/kg' },
        { id: 'tomato', price: '₹30/kg' },
        { id: 'onion', price: '₹50/kg' },
        { id: 'coriander', price: '₹10/bunch' },
    ],
    distance: 80, // meters
    location: {
        latitude: 12.9405, // Will be adjusted relative to user
        longitude: 77.6015,
    }
};

const PushCartRadar = ({ navigation }) => {
    // States: 'SETUP', 'SCANNING', 'DETECTED'
    const [state, setState] = useState('SETUP');
    const [userLocation, setUserLocation] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [t, setT] = useState({});
    const [vendorData, setVendorData] = useState(INITIAL_VENDOR);

    // Load Translations
    // Load Translations
    useFocusEffect(
        useCallback(() => {
            const loadTranslations = async () => {
                const lang = await AsyncStorage.getItem('language') || 'en';
                setT({
                    setupTitle: getTranslationSync('setupTitle', lang),
                    setupDesc: getTranslationSync('setupDesc', lang),
                    setupBtn: getTranslationSync('setupBtn', lang),
                    scanning: getTranslationSync('scanning', lang),
                    cartNearby: getTranslationSync('cartNearby', lang),
                    distanceAway: getTranslationSync('distanceAway', lang),
                    todaysFresh: getTranslationSync('todaysFresh', lang),
                    viewFullMenu: getTranslationSync('viewFullMenu', lang),
                    changeLocation: getTranslationSync('changeLocation', lang),
                    confirmLocation: getTranslationSync('confirmLocation', lang) || "Confirm Location",
                    dragMap: getTranslationSync('dragMap', lang) || "Move the map to set your home location",
                    radarTitle: getTranslationSync('radarTitle', lang),
                });

                // Translate Vendor Data
                setVendorData((prev) => ({
                    ...prev,
                    name: getTranslationSync('pushCartDetail', lang),
                    // items: INITIAL_VENDOR.items.map(item => ({
                    //     ...item,
                    //     name: getTranslationSync(item.id, lang)
                    // }))
                    items: INITIAL_VENDOR.items.map(item => ({
                        ...item,
                        name: getTranslationSync(item.id, lang)
                    }))
                }));
            };
            loadTranslations();
        }, [])
    );

    // Get Location on Setup
    const handleSetup = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Location is required for Radar to work.');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        setState('PICKING'); // Switch to picking state instead of scanning immediately
    };

    const confirmLocation = () => {
        if (!userLocation) {
            Alert.alert("Location Error", "Please set a location first.");
            return;
        }
        setState('SCANNING');
    };

    // Toggle Demo Mode (Cycles states)
    const toggleDemo = () => {
        setIsDemoMode(!isDemoMode);
        if (!isDemoMode) {
            // Start Demo Loop
            if (state === 'SETUP') handleSetup();
            setTimeout(() => setState('SCANNING'), 500);
            setTimeout(() => setState('DETECTED'), 3000); // Detect after 3s
        } else {
            setState('SCANNING'); // Reset
        }
    };

    // Render Setup State
    const renderSetup = () => (
        <View style={styles.setupContainer}>
            <View style={styles.illustrationContainer}>
                <Icon name="storefront" size={80} color={theme.colors.primary} />
                <View style={styles.pulseRing} />
            </View>
            <Text style={[styles.setupTitle, { color: theme.colors.textPrimary }]}>{t.setupTitle || "Never miss your favorite street vendor!"}</Text>
            <Text style={[styles.setupDesc, { color: theme.colors.textSecondary }]}>{t.setupDesc || "Get notified when they are near your home."}</Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSetup}>
                <Text style={styles.primaryBtnText}>{t.setupBtn || "Set Home Location & Turn On Alerts"}</Text>
                <Icon name="my-location" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );

    // Render Location Picker
    const renderLocationPicker = () => (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation?.latitude || 19.0760,
                    longitude: userLocation?.longitude || 72.8777,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                onRegionChangeComplete={(region) => {
                    setUserLocation({
                        latitude: region.latitude,
                        longitude: region.longitude,
                    });
                }}
            />

            {/* Fixed Center Marker */}
            <View style={styles.centerMarkerContainer} pointerEvents="none">
                <View style={styles.homeMarker}>
                    <Icon name="home" size={24} color="white" />
                </View>
                <View style={styles.markerStem} />
            </View>

            <View style={styles.pickerOverlay}>
                <View style={styles.pickerInstruction}>
                    <Icon name="touch-app" size={20} color="white" />
                    <Text style={styles.pickerText}>{t.dragMap || "Move the map to set your home location"}</Text>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={confirmLocation}>
                    <Text style={styles.confirmBtnText}>{t.confirmLocation || "Confirm Location"}</Text>
                    <Icon name="check" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Render Scanning State
    const renderScanning = () => (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation?.latitude || 12.9716,
                    longitude: userLocation?.longitude || 77.5946,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
            >
                {userLocation && (
                    <>
                        <Marker coordinate={userLocation}>
                            <View style={styles.homeMarker}>
                                <Icon name="home" size={20} color="white" />
                            </View>
                        </Marker>
                        <Circle
                            center={userLocation}
                            radius={100}
                            fillColor="rgba(255, 160, 0, 0.2)"
                            strokeColor="rgba(255, 160, 0, 0.5)"
                        />
                    </>
                )}
            </MapView>

            <View style={styles.statusOverlay}>
                <View style={styles.scanningBadge}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.scanningText}>{t.scanning || "Scanning 100m radius around Home..."}</Text>
                </View>
                <TouchableOpacity style={styles.settingsBtn}>
                    <Icon name="settings" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Render Detected State
    const renderDetected = () => (
        <ScrollView style={styles.detectedContainer} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.notificationHeader}>
                <View style={styles.badge}>
                    <Icon name="notifications-active" size={16} color="white" />
                    <Text style={styles.badgeText}>{t.cartNearby || "Cart Nearby!"}</Text>
                </View>
                <Text style={styles.vendorName}>{vendorData.name}</Text>
            </View>

            <View style={styles.cardContent}>
                <Image source={vendorData.image} style={styles.vendorImage} />

                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>{t.todaysFresh || "Today's Fresh Vegetables"}</Text>
                    <View style={styles.itemList}>
                        {vendorData.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{item.price}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Mini Map */}
                <View style={styles.miniMapContainer}>
                    <MapView
                        style={styles.miniMap}
                        initialRegion={{
                            latitude: userLocation?.latitude || 12.9716,
                            longitude: userLocation?.longitude || 77.5946,
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.002,
                        }}
                        scrollEnabled={false}
                    >
                        <Marker coordinate={userLocation}>
                            <View style={styles.homeMarkerSmall}>
                                <Icon name="home" size={12} color="white" />
                            </View>
                        </Marker>
                        <Marker
                            coordinate={{
                                latitude: (userLocation?.latitude || 12.9716) + 0.0005,
                                longitude: (userLocation?.longitude || 77.5946) + 0.0005,
                            }}
                        >
                            <Image source={require('../assets/logo_icon.png')} style={{ width: 20, height: 20 }} />
                        </Marker>
                    </MapView>
                    <View style={styles.distanceBadge}>
                        <Icon name="near-me" size={12} color="white" />
                        <Text style={styles.distanceText}>80 {t.distanceAway || "meters away"}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.viewMenuBtn} onPress={() => navigation.navigate('PushCartDetail')}>
                <Text style={styles.viewMenuText}>{t.viewFullMenu || "View Full Menu"}</Text>
                <Icon name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
        </ScrollView>
    );



    return (
        <View style={styles.container}>
            {/* Header / Demo Toggle */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.radarTitle || "Push Cart Radar"}</Text>
                <View style={styles.demoToggle}>
                    <Text style={styles.demoText}>Demo</Text>
                    <Switch value={isDemoMode} onValueChange={toggleDemo} trackColor={{ true: theme.colors.primary }} />
                </View>
            </View>

            <View style={styles.content}>
                {state === 'SETUP' && renderSetup()}
                {state === 'PICKING' && renderLocationPicker()}
                {state === 'SCANNING' && renderScanning()}
                {state === 'DETECTED' && renderDetected()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F0', // Warm, homely background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    demoToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    demoText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    content: {
        flex: 1,
    },
    // Setup Styles
    setupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    illustrationContainer: {
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 160, 0, 0.1)',
        zIndex: -1,
    },
    setupTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#4A3B32', // Dark earthy tone
    },
    setupDesc: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 40,
        lineHeight: 24,
    },
    primaryBtn: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        gap: 10,
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Picker Styles
    pickerOverlay: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: 'center',
        gap: 20,
    },
    pickerInstruction: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pickerText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    confirmBtn: {
        backgroundColor: theme.colors.primary, // Using theme primary
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 5,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 5,
    },
    confirmBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    centerMarkerContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -32, // Half height of marker + some offset
        marginLeft: -20, // Half width
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerStem: {
        width: 2,
        height: 10,
        backgroundColor: theme.colors.primary,
        marginTop: -2,
    },
    // Scanning Styles
    mapContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    statusOverlay: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scanningBadge: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginRight: 10,
    },
    scanningText: {
        color: 'white',
        fontSize: 14,
    },
    settingsBtn: {
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    homeMarker: {
        backgroundColor: theme.colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
    },
    // Detected Styles
    detectedContainer: {
        flex: 1,
        padding: 20,
    },
    notificationHeader: {
        marginBottom: 15,
    },
    badge: {
        flexDirection: 'row',
        backgroundColor: theme.colors.success || '#22C55E',
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignItems: 'center',
        gap: 5,
        marginBottom: 5,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    vendorName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    cardContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
        marginBottom: 20,
    },
    vendorImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    detailsSection: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: theme.colors.textPrimary,
    },
    itemList: {
        gap: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    miniMapContainer: {
        height: 120,
        position: 'relative',
    },
    miniMap: {
        flex: 1,
    },
    distanceBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    homeMarkerSmall: {
        backgroundColor: theme.colors.primary,
        padding: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
    },
    viewMenuBtn: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        gap: 10,
        elevation: 2,
    },
    viewMenuText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PushCartRadar;
