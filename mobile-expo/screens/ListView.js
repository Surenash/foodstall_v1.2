import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
    Alert,
    SafeAreaView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import StallCard from '../components/StallCard';
import { stallsAPI } from '../services/api';
// import theme from '../styles/theme'; // Removed
import { useTheme } from '../context/ThemeContext'; // Import Context
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslationSync } from '../services/translations';

/**
 * ListView Screen
 * Displays stalls in a list with search and filter capabilities
 */
const ListView = ({ navigation }) => {
    const { theme } = useTheme(); // Use Context
    const [stalls, setStalls] = useState([]);
    const [filteredStalls, setFilteredStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [t, setT] = useState({});

    useEffect(() => {
        const loadTranslations = async () => {
            const lang = await AsyncStorage.getItem('language') || 'en';
            setT({
                searchStalls: getTranslationSync('searchStalls', lang),
                nearbyStalls: getTranslationSync('nearbyStalls', lang),
                popularStalls: getTranslationSync('popularStalls', lang), // using for now
                findingStalls: 'Finding stalls near you...', // Add these to translations
                noStallsFound: 'No stalls found', // Add these to translations
                resultsFound: 'stalls found',
                stall: 'stall',
            });
        };
        loadTranslations();
    }, []);

    // Filter states
    const [filters, setFilters] = useState({
        openOnly: false,
        dietaryTags: [],
        maxDistance: 5, // km
    });

    const dietaryOptions = ['Vegetarian', 'Jain', 'Halal', 'Vegan', 'Non-Veg'];

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            fetchStalls();
        }
    }, [userLocation]);

    useEffect(() => {
        applyFilters();
    }, [stalls, searchQuery, filters]);

    const getUserLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Use default Mumbai location if permission denied
                console.log('Location permission denied');
                setUserLocation({ latitude: 19.0760, longitude: 72.8777 });
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        } catch (error) {
            console.error('Location error:', error);
            // Use default Mumbai location
            setUserLocation({ latitude: 19.0760, longitude: 72.8777 });
        }
    };

    const fetchStalls = async () => {
        try {
            setLoading(true);
            const data = await stallsAPI.getNearby(
                userLocation.latitude,
                userLocation.longitude,
                filters.maxDistance * 1000, // Convert km to meters
                filters.openOnly
            );
            setStalls(data.stalls || []);
        } catch (error) {
            console.log('API unavailable, using mock data:', error.message);
            // Use mock data as fallback
            setStalls([
                {
                    id: '1',
                    name: "Surena's Stall",
                    cuisine_type: 'South Indian',
                    description: 'Authentic South Indian delicacies - Crispy Dosas, fluffy Idlis, and piping hot Sambar',
                    is_open: true,
                    hygiene_score: 4.5,
                    rating: 4.7,
                    review_count: 156,
                    distance_km: '0.3',
                    dietary_tags: ['Vegetarian', 'Vegan'],
                    image: require('../assets/surenas_stall (1).png'),
                    menu_highlights: 'Masala Dosa ₹60 | Idli Sambar ₹40 | Filter Coffee ₹20',
                    location: { latitude: 19.0760, longitude: 72.8777 },
                },
                {
                    id: '2',
                    name: "Raju's Chaat Corner",
                    cuisine_type: 'North Indian Street Food',
                    description: 'Famous for Pani Puri, Bhel Puri, and Sev Puri since 1985',
                    is_open: true,
                    hygiene_score: 4.2,
                    rating: 4.5,
                    review_count: 230,
                    distance_km: '0.5',
                    dietary_tags: ['Vegetarian', 'Jain'],
                    image: require('../assets/rajus_chaat (1).png'),
                    menu_highlights: 'Pani Puri ₹30 | Bhel Puri ₹40 | Sev Puri ₹45',
                    location: { latitude: 19.0765, longitude: 72.8780 },
                },
                {
                    id: '3',
                    name: 'Biryani Express',
                    cuisine_type: 'Hyderabadi',
                    description: 'Authentic Dum Biryani and Haleem',
                    is_open: false,
                    hygiene_score: 4.0,
                    rating: 4.3,
                    review_count: 89,
                    distance_km: '1.2',
                    dietary_tags: ['Halal', 'Non-Veg'],
                    image: require('../assets/biryani_express(1).png'),
                    menu_highlights: 'Chicken Biryani ₹120 | Mutton Biryani ₹180',
                    location: { latitude: 19.0750, longitude: 72.8790 },
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...stalls];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (stall) =>
                    stall.name.toLowerCase().includes(query) ||
                    stall.cuisine_type?.toLowerCase().includes(query) ||
                    stall.description?.toLowerCase().includes(query)
            );
        }

        // Dietary tags filter
        if (filters.dietaryTags.length > 0) {
            result = result.filter((stall) =>
                stall.dietary_tags?.some((tag) =>
                    filters.dietaryTags.includes(tag)
                )
            );
        }

        // Distance filter
        result = result.filter(
            (stall) => parseFloat(stall.distance_km) <= filters.maxDistance
        );

        setFilteredStalls(result);
    };

    const toggleDietaryTag = (tag) => {
        setFilters((prev) => {
            const tags = prev.dietaryTags.includes(tag)
                ? prev.dietaryTags.filter((t) => t !== tag)
                : [...prev.dietaryTags, tag];
            return { ...prev, dietaryTags: tags };
        });
    };

    const clearFilters = () => {
        setFilters({
            openOnly: false,
            dietaryTags: [],
            maxDistance: 5,
        });
        setSearchQuery('');
    };

    const renderStallCard = ({ item }) => (
        <StallCard
            stall={item}
            onPress={() => navigation.navigate('StallDetail', { stallId: item.id })}
        />
    );

    const renderFilterModal = () => (
        <Modal
            visible={showFilters}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilters(false)}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Icon name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Open Only Toggle */}
                    <TouchableOpacity
                        style={[styles.filterOption, { borderBottomColor: theme.colors.border }]}
                        onPress={() => setFilters({ ...filters, openOnly: !filters.openOnly })}
                    >
                        <Text style={[styles.filterLabel, { color: theme.colors.textPrimary }]}>Show Open Stalls Only</Text>
                        <Icon
                            name={filters.openOnly ? 'check-box' : 'check-box-outline-blank'}
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    {/* Dietary Tags */}
                    <Text style={[styles.filterSectionTitle, { color: theme.colors.textPrimary }]}>Dietary Preferences</Text>
                    <View style={styles.tagsContainer}>
                        {dietaryOptions.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                style={[
                                    styles.tagChip,
                                    { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                                    filters.dietaryTags.includes(tag) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                                ]}
                                onPress={() => toggleDietaryTag(tag)}
                            >
                                <Text
                                    style={[
                                        styles.tagChipText,
                                        { color: theme.colors.textPrimary },
                                        filters.dietaryTags.includes(tag) && { color: theme.colors.textLight },
                                    ]}
                                >
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Max Distance Slider */}
                    <Text style={[styles.filterSectionTitle, { color: theme.colors.textPrimary }]}>
                        Max Distance: {filters.maxDistance} km
                    </Text>
                    <View style={styles.distanceButtons}>
                        {[1, 2, 5, 10].map((distance) => (
                            <TouchableOpacity
                                key={distance}
                                style={[
                                    styles.distanceButton,
                                    { borderColor: theme.colors.border },
                                    filters.maxDistance === distance && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                                ]}
                                onPress={() => setFilters({ ...filters, maxDistance: distance })}
                            >
                                <Text
                                    style={[
                                        styles.distanceButtonText,
                                        { color: theme.colors.textPrimary },
                                        filters.maxDistance === distance && { color: theme.colors.textLight },
                                    ]}
                                >
                                    {distance} km
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Actions */}
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.clearButton, { borderColor: theme.colors.border }]}
                            onPress={clearFilters}
                        >
                            <Text style={[styles.clearButtonText, { color: theme.colors.textPrimary }]}>Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => {
                                fetchStalls();
                                setShowFilters(false);
                            }}
                        >
                            <Text style={[styles.applyButtonText, { color: theme.colors.textLight }]}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Finding stalls near you...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
                <Icon name="search" size={24} color={theme.colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                    placeholder={t.searchStalls || "Search by name or cuisine..."}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters(true)}
                >
                    <Icon name="filter-list" size={24} color={theme.colors.primary} />
                    {(filters.openOnly || filters.dietaryTags.length > 0) && (
                        <View style={[styles.filterBadge, { backgroundColor: theme.colors.error }]} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Active Filters Display */}
            {(filters.openOnly || filters.dietaryTags.length > 0) && (
                <View style={styles.activeFilters}>
                    {filters.openOnly && (
                        <View style={[styles.activeFilterChip, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.activeFilterText, { color: theme.colors.textLight }]}>Open Now</Text>
                        </View>
                    )}
                    {filters.dietaryTags.map((tag) => (
                        <View key={tag} style={[styles.activeFilterChip, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.activeFilterText, { color: theme.colors.textLight }]}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={[styles.resultsText, { color: theme.colors.textPrimary }]}>
                    {filteredStalls.length} stall{filteredStalls.length !== 1 ? 's' : ''} found
                </Text>
                {filteredStalls.length > 0 && (
                    <TouchableOpacity onPress={fetchStalls}>
                        <Icon name="refresh" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Stalls List */}
            {filteredStalls.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="store" size={64} color={theme.colors.border} />
                    <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>No stalls found</Text>
                    <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                        Try adjusting your filters or search query
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredStalls}
                    renderItem={renderStallCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Filter Modal */}
            {renderFilterModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: theme.colors.background, // Dynamic
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16, // theme.spacing.md
        fontSize: 16, // theme.typography.fontSize.base
        // color: theme.colors.textSecondary, // Dynamic
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: theme.colors.surface, // Dynamic
        margin: 16, // theme.spacing.md
        paddingHorizontal: 16, // theme.spacing.md
        borderRadius: 8, // theme.borderRadius.md
        // ...theme.shadows.sm, // Manual shadow
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 16, // theme.spacing.md
        paddingHorizontal: 8, // theme.spacing.sm
        fontSize: 16, // theme.typography.fontSize.base
        // color: theme.colors.textPrimary, // Dynamic
    },
    filterButton: {
        padding: 4, // theme.spacing.xs
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        // backgroundColor: theme.colors.error, // Dynamic
    },
    activeFilters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16, // theme.spacing.md
        marginBottom: 8, // theme.spacing.sm
    },
    activeFilterChip: {
        // backgroundColor: theme.colors.primary, // Dynamic
        paddingHorizontal: 8, // theme.spacing.sm
        paddingVertical: 4, // theme.spacing.xs
        borderRadius: 4, // theme.borderRadius.sm
        marginRight: 4, // theme.spacing.xs
        marginBottom: 4, // theme.spacing.xs
    },
    activeFilterText: {
        fontSize: 14, // theme.typography.fontSize.sm
        fontFamily: 'System', // theme.typography.fontFamily.medium
        // color: theme.colors.textLight, // Dynamic
        fontWeight: '500',
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16, // theme.spacing.md
        marginBottom: 8, // theme.spacing.sm
    },
    resultsText: {
        fontSize: 16, // theme.typography.fontSize.base
        fontFamily: 'System', // theme.typography.fontFamily.semibold
        fontWeight: '600',
        // color: theme.colors.textPrimary, // Dynamic
    },
    listContent: {
        paddingBottom: 100, // Space for bottom navigation bar
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32, // theme.spacing.xl
    },
    emptyText: {
        fontSize: 20, // theme.typography.fontSize.lg
        fontFamily: 'System', // theme.typography.fontFamily.semibold
        fontWeight: '600',
        // color: theme.colors.textPrimary, // Dynamic
        marginTop: 16, // theme.spacing.md
    },
    emptySubtext: {
        fontSize: 14, // theme.typography.fontSize.sm
        fontFamily: 'System', // theme.typography.fontFamily.regular
        // color: theme.colors.textSecondary, // Dynamic
        marginTop: 4, // theme.spacing.xs
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        // backgroundColor: theme.colors.background, // Dynamic
        borderTopLeftRadius: 16, // theme.borderRadius.xl
        borderTopRightRadius: 16, // theme.borderRadius.xl
        padding: 24, // theme.spacing.lg
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24, // theme.spacing.lg
    },
    modalTitle: {
        fontSize: 24, // theme.typography.fontSize['2xl']
        fontFamily: 'System', // theme.typography.fontFamily.bold
        fontWeight: 'bold',
        // color: theme.colors.textPrimary, // Dynamic
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16, // theme.spacing.md
        borderBottomWidth: 1,
        // borderBottomColor: theme.colors.border, // Dynamic
    },
    filterLabel: {
        fontSize: 16, // theme.typography.fontSize.base
        fontFamily: 'System', // theme.typography.fontFamily.medium
        fontWeight: '500',
        // color: theme.colors.textPrimary, // Dynamic
    },
    filterSectionTitle: {
        fontSize: 16, // theme.typography.fontSize.base
        fontFamily: 'System', // theme.typography.fontFamily.semibold
        fontWeight: '600',
        // color: theme.colors.textPrimary, // Dynamic
        marginTop: 24, // theme.spacing.lg
        marginBottom: 8, // theme.spacing.sm
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tagChip: {
        paddingHorizontal: 16, // theme.spacing.md
        paddingVertical: 8, // theme.spacing.sm
        borderRadius: 8, // theme.borderRadius.md
        borderWidth: 1,
        // borderColor: theme.colors.border, // Dynamic
        marginRight: 8, // theme.spacing.sm
        marginBottom: 8, // theme.spacing.sm
    },
    tagChipText: {
        fontSize: 14, // theme.typography.fontSize.sm
        fontFamily: 'System', // theme.typography.fontFamily.medium
        fontWeight: '500',
        // color: theme.colors.textPrimary, // Dynamic
    },
    distanceButtons: {
        flexDirection: 'row',
        gap: 8, // theme.spacing.sm
    },
    distanceButton: {
        flex: 1,
        paddingVertical: 8, // theme.spacing.sm
        borderRadius: 8, // theme.borderRadius.md
        borderWidth: 1,
        // borderColor: theme.colors.border, // Dynamic
        alignItems: 'center',
    },
    distanceButtonText: {
        fontSize: 14, // theme.typography.fontSize.sm
        fontFamily: 'System', // theme.typography.fontFamily.medium
        fontWeight: '500',
        // color: theme.colors.textPrimary, // Dynamic
    },
    modalActions: {
        flexDirection: 'row',
        gap: 8, // theme.spacing.sm
        marginTop: 32, // theme.spacing.xl
    },
    clearButton: {
        flex: 1,
        paddingVertical: 16, // theme.spacing.md
        borderRadius: 8, // theme.borderRadius.md
        borderWidth: 1,
        // borderColor: theme.colors.border, // Dynamic
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 16, // theme.typography.fontSize.base
        fontFamily: 'System', // theme.typography.fontFamily.semibold
        fontWeight: '600',
        // color: theme.colors.textPrimary, // Dynamic
    },
    applyButton: {
        flex: 1,
        paddingVertical: 16, // theme.spacing.md
        borderRadius: 8, // theme.borderRadius.md
        // backgroundColor: theme.colors.primary, // Dynamic
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16, // theme.typography.fontSize.base
        fontFamily: 'System', // theme.typography.fontFamily.semibold
        fontWeight: '600',
        // color: theme.colors.textLight, // Dynamic
    },
});

export default ListView;
