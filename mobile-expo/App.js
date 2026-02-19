import React, { useCallback } from 'react';
import { Image, StatusBar } from 'react-native'; // Added StatusBar
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslationSync } from './services/translations';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // Import Context

// Removing direct theme import to encourage useTheme hook
// import theme from './styles/theme'; 
import { lightColors } from './styles/theme'; // Fallback for outside context if needed

// Screens
// Note: Ensure these filenames match exactly what is in the directory
import LanguageSelection from './screens/LanguageSelection';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import MapViewScreen from './screens/MapView'; // Renamed import to avoid conflict
import ListView from './screens/ListView';
import StallDetail from './screens/StallDetail';
import ReviewForm from './screens/ReviewForm';
import OwnerDashboard from './screens/OwnerDashboard';
import StallProfileEditor from './screens/StallProfileEditor';

// Customer Profile Screens
import UserProfile from './screens/UserProfile';
import Favorites from './screens/Favorites';
import MyReviews from './screens/MyReviews';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import ReportStall from './screens/ReportStall';

import About from './screens/About';
import Help from './screens/Help';
import PushCartRadar from './screens/PushCartRadar';
import PushCartDetail from './screens/PushCartDetail';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator (User App)
 */
function UserTabs() {
  const [t, setT] = React.useState({});

  const { theme } = useTheme(); // Use dynamic theme

  useFocusEffect(
    useCallback(() => {
      const loadTranslations = async () => {
        const lang = await AsyncStorage.getItem('language') || 'en';
        setT({
          map: getTranslationSync('map', lang),
          list: getTranslationSync('list', lang),
          profile: getTranslationSync('profile', lang),
          nearbyStalls: getTranslationSync('nearbyStalls', lang),
          allStalls: getTranslationSync('allStalls', lang),
          myProfile: getTranslationSync('myProfile', lang),
          radar: getTranslationSync('radar', lang),
        });
      };
      loadTranslations();
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'List') {
            iconName = 'list';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Radar') {
            iconName = 'track-changes';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background, // Dynamic background
          borderTopColor: theme.colors.border,
          height: 90,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.medium,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textLight, // Assuming textLight is white and works on primary
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: theme.typography.fontSize.lg,
        },
        headerRight: () => (
          <Image
            source={require('./assets/logo_icon.png')}
            style={{ width: 30, height: 30, marginRight: 15 }}
            resizeMode="contain"
          />
        ),
      })}
    >
      <Tab.Screen
        name="Map"
        component={MapViewScreen}
        options={{ title: t.nearbyStalls || 'Nearby Stalls', tabBarLabel: t.map || 'Map' }}
      />
      <Tab.Screen
        name="List"
        component={ListView}
        options={{ title: t.allStalls || 'All Stalls', tabBarLabel: t.list || 'List' }}
      />
      <Tab.Screen
        name="Radar"
        component={PushCartRadar}
        options={{
          title: t.radarTitle || 'Push Cart Radar',
          tabBarLabel: t.radar || 'Radar',
          headerShown: false // Radar screen has its own header
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfile}
        options={{ title: t.myProfile || 'My Profile', tabBarLabel: t.profile || 'Profile' }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Navigator
 */
function App() {
  const [t, setT] = React.useState({});

  React.useEffect(() => {
    const loadTranslations = async () => {
      const lang = await AsyncStorage.getItem('language') || 'en';
      setT({
        stallDetails: getTranslationSync('stallDetails', lang),
        writeReview: getTranslationSync('writeReview', lang),
        ownerDashboard: getTranslationSync('ownerDashboard', lang),
        editStallProfile: getTranslationSync('editStallProfile', lang),
        myFavorites: getTranslationSync('myFavorites', lang),
        myReviews: getTranslationSync('myReviews', lang),
        settings: getTranslationSync('settings', lang),
        notifications: getTranslationSync('notifications', lang),
        reportIssue: getTranslationSync('reportIssue', lang),
        about: getTranslationSync('about', lang),
        helpSupport: getTranslationSync('helpSupport', lang),
      });
    };
    loadTranslations();
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LanguageSelection"
          screenOptions={{
            headerStyle: {
              backgroundColor: lightColors.primary, // Initial static fallback, screens will override
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontFamily: 'System',
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerRight: () => (
              <Image
                source={require('./assets/logo_icon.png')}
                style={{ width: 30, height: 30, marginRight: 15 }}
                resizeMode="contain"
              />
            ),
            // Default card style removed here, handled by individual screens using context 
            // or by NavigationContainer's theme prop if we were using that fully.
            // For now, let's let screens handle their background color via context.
          }}
        >
          {/* Onboarding */}
          <Stack.Screen
            name="LanguageSelection"
            component={LanguageSelection}
            options={{ headerShown: false }}
          />

          {/* Authentication */}
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />

          {/* Main User App */}
          <Stack.Screen
            name="Main"
            component={UserTabs}
            options={{ headerShown: false }}
          />

          {/* Stall Detail */}
          <Stack.Screen
            name="StallDetail"
            component={StallDetail}
            options={{ title: t.stallDetails || 'Stall Details' }}
          />

          {/* Push Cart Detail (Dedicated) */}
          <Stack.Screen
            name="PushCartDetail"
            component={PushCartDetail}
            options={{ headerShown: false }}
          />

          {/* Review Form */}
          <Stack.Screen
            name="ReviewForm"
            component={ReviewForm}
            options={{ title: t.writeReview || 'Write Review' }}
          />

          {/* Owner Dashboard */}
          <Stack.Screen
            name="OwnerDashboard"
            component={OwnerDashboard}
            options={{ title: t.ownerDashboard || 'Owner Dashboard' }}
          />

          {/* Stall Profile Editor */}
          <Stack.Screen
            name="StallProfileEditor"
            component={StallProfileEditor}
            options={{ title: t.editStallProfile || 'Edit Stall Profile' }}
          />

          {/* Customer Profile Screens */}
          <Stack.Screen
            name="Favorites"
            component={Favorites}
            options={{ title: t.myFavorites || 'My Favorites' }}
          />
          <Stack.Screen
            name="MyReviews"
            component={MyReviews}
            options={{ title: t.myReviews || 'My Reviews' }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ title: t.settings || 'Settings' }}
          />
          <Stack.Screen
            name="Notifications"
            component={Notifications}
            options={{ title: t.notifications || 'Notifications' }}
          />
          <Stack.Screen
            name="ReportStall"
            component={ReportStall}
            options={{ title: t.reportIssue || 'Report Issue' }}
          />
          <Stack.Screen
            name="About"
            component={About}
            options={{ title: t.about || 'About' }}
          />
          <Stack.Screen
            name="Help"
            component={Help}
            options={{ title: t.helpSupport || 'Help & Support' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

export default App;

