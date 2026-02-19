import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
// import theme from '../styles/theme'; // Removed - using Context
import { useTheme } from '../context/ThemeContext'; // Import Context
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslationSync } from '../services/translations';

const PushCartDetail = ({ navigation, route }) => {
    const { theme } = useTheme(); // Use Context
    // Initial Data with IDs for translation
    const INITIAL_VENDOR = {
        name: "Anna's Vegetable Cart",
        image: require('../assets/psuh_cart.png'),
        description: "Fresh farm vegetables direct to your home",
        items: [
            { id: 'potato', price: '₹40/kg' },
            { id: 'tomato', price: '₹30/kg' },
            { id: 'onion', price: '₹50/kg' },
            { id: 'coriander', price: '₹10/bunch' },
            { id: 'carrot', price: '₹60/kg' },
            { id: 'beans', price: '₹50/kg' },
        ],
        location: "Currently at: 4th Block, Jayanagar"
    };

    const [t, setT] = useState({});
    const [vendorData, setVendorData] = useState(INITIAL_VENDOR);

    useEffect(() => {
        const loadTranslations = async () => {
            const lang = await AsyncStorage.getItem('language') || 'en';

            setT({
                menu: getTranslationSync('menu', lang),
                call: getTranslationSync('call', lang),
                directions: getTranslationSync('directions', lang),
            });

            // Translate Vendor Data
            setVendorData({
                ...INITIAL_VENDOR,
                name: getTranslationSync('pushCartDetail', lang),
                description: getTranslationSync('cartDescription', lang),
                location: getTranslationSync('cartLocation', lang),
                items: INITIAL_VENDOR.items.map(item => ({
                    ...item,
                    name: getTranslationSync(item.id, lang)
                }))
            });
        };
        loadTranslations();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Floating Back Button - Fixed position */}
            <TouchableOpacity style={styles.floatingBackButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image source={vendorData.image} style={styles.headerImage} />
                    <View style={styles.overlay} />
                    <View style={styles.headerContent}>
                        <Text style={styles.vendorName}>{vendorData.name}</Text>
                        <Text style={styles.vendorDesc}>{vendorData.description}</Text>
                        <View style={styles.locationBadge}>
                            <Icon name="location-on" size={14} color="white" />
                            <Text style={styles.locationText}>{vendorData.location}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Content */}
                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t.menu || 'Menu'}</Text>
                        <View style={styles.line} />
                    </View>

                    <View style={styles.grid}>
                        {vendorData.items.map((item, index) => (
                            <View key={index} style={styles.card}>
                                {/* Simple Icon placeholder since we don't have real imgs for all veg */}
                                <View style={styles.iconPlaceholder}>
                                    <Icon name="restaurant" size={24} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{item.price}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Contact Actions */}
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}>
                            <Icon name="call" size={20} color="white" />
                            <Text style={styles.actionText}>{t.call || 'Call'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2196F3' }]}>
                            <Icon name="directions" size={20} color="white" />
                            <Text style={styles.actionText}>{t.directions || 'Directions'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#F5F5F5', // Dynamic
    },
    imageContainer: {
        height: 250,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    floatingBackButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 8,
        borderRadius: 20,
        zIndex: 100,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    vendorName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    vendorDesc: {
        fontSize: 16,
        color: '#E0E0E0',
        marginBottom: 10,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignSelf: 'flex-start',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        gap: 5,
    },
    locationText: {
        color: 'white',
        fontSize: 12,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        // backgroundColor: '#F5F5F5', // Dynamic
        marginTop: -20,
        padding: 20,
        minHeight: 500,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        // color: theme.colors.textPrimary, // Dynamic
        marginRight: 15,
    },
    line: {
        flex: 1,
        height: 1,
        // backgroundColor: '#E0E0E0', // Dynamic
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    card: {
        width: '47%',
        // backgroundColor: 'white', // Dynamic
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        marginBottom: 10,
    },
    iconPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        // backgroundColor: '#FFF8E1', // Dynamic
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        // color: theme.colors.textPrimary, // Dynamic
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 14,
        // color: theme.colors.primary, // Dynamic
        fontWeight: 'bold',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 15,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        gap: 10,
        elevation: 2,
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PushCartDetail;
