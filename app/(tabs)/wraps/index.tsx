import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const WRAPS_DATA = [
    {
        id: 'w1',
        title: 'Finding balance',
        theme: 'Creative expression and intentional rest.',
        image: 'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'w2',
        title: 'Deep Focus',
        theme: 'Professional boundaries and deep work habits.',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'w3',
        title: 'Gratitude',
        theme: 'Daily reflections and small acts of kindness.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'w4',
        title: 'New horizons',
        theme: 'Exploring possibilities and building momentum.',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'w5',
        title: 'Quiet reflection',
        theme: 'Mindfulness and internal alignment.',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'w6',
        title: 'Action oriented',
        theme: 'Execution and consistent showing up.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    }
];

export default function WrapsScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('All');

    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({ light: '#F3F4F6', dark: '#171717' }, 'background');
    const cardBg = useThemeColor({ light: '#F9F9F7', dark: '#151718' }, 'background'); // Pi-like off-white or dark
    const avatarBg = useThemeColor({ light: '#E8E8E3', dark: '#262626' }, 'background');

    const renderWrapCard = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 100)}
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/wrap/${item.id}` as any)}
                style={[styles.card, { backgroundColor: cardBg }]}
            >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                    <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <ThemedText type="title" style={styles.title}>Your Wraps</ThemedText>
                        <TouchableOpacity style={[styles.avatarButton, { backgroundColor: avatarBg }]}>
                            <User size={20} color={iconColor} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterSection}>
                        {['All', 'Favorites', '2024'].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => setActiveFilter(filter)}
                                style={[
                                    styles.filterChip,
                                    activeFilter === filter && { backgroundColor: iconColor }
                                ]}
                            >
                                <ThemedText style={[
                                    styles.filterText,
                                    activeFilter === filter && { color: cardBg }
                                ]}>
                                    {filter}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <FlatList
                    data={WRAPS_DATA}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.gridContent}
                    renderItem={renderWrapCard}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 38,
        fontFamily: 'PPEditorial',
    },
    avatarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterSection: {
        flexDirection: 'row',
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: 'rgba(128,128,128,0.08)',
    },
    filterText: {
        fontSize: 14,
        fontFamily: 'Manrope_600SemiBold',
        letterSpacing: -0.2,
    },
    gridContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    cardContainer: {
        width: COLUMN_WIDTH,
        margin: 8,
    },
    card: {
        borderRadius: 28,
        overflow: 'hidden',
        height: 250,
        elevation: 0,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.03)',
    },
    cardImage: {
        width: '100%',
        height: 165,
    },
    cardContent: {
        padding: 16,
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 19,
        fontFamily: 'Manrope_600SemiBold',
        lineHeight: 25,
        letterSpacing: -0.5,
    }
});
