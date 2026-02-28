import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth.context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ensureLatestWraps, getWrapsForUser, WrapDoc } from '@/services/wraps.service';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

export default function WrapsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All');
    const [wraps, setWraps] = useState<WrapDoc[]>([]);
    const [loading, setLoading] = useState(true);

    const iconColor = useThemeColor({}, 'icon');
    const cardBg = useThemeColor({ light: '#F9F9F7', dark: '#151718' }, 'background'); // Pi-like off-white or dark
    const avatarBg = useThemeColor({ light: '#E8E8E3', dark: '#262626' }, 'background');

    useEffect(() => {
        let mounted = true;

        const loadWraps = async () => {
            if (!user) return;
            setLoading(true);
            try {
                try {
                    await ensureLatestWraps(user.uid);
                } catch (error) {
                    console.error('Error generating latest wraps:', error);
                }

                const data = await getWrapsForUser(user.uid);
                if (mounted) setWraps(data);
            } catch (error) {
                console.error('Error loading wraps:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadWraps();
        return () => {
            mounted = false;
        };
    }, [user]);

    const filteredWraps = useMemo(() => {
        if (activeFilter === 'Weekly') return wraps.filter((wrap) => wrap.periodType === 'weekly');
        if (activeFilter === 'Monthly') return wraps.filter((wrap) => wrap.periodType === 'monthly');
        return wraps;
    }, [activeFilter, wraps]);

    const renderWrapCard = ({ item, index }: { item: WrapDoc, index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 100)}
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/wrap/${item.id}` as any)}
                style={[styles.card, { backgroundColor: cardBg }]}
            >
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                ) : (
                    <View style={[styles.cardImage, { backgroundColor: avatarBg }]} />
                )}
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
                        {['All', 'Weekly', 'Monthly'].map((filter) => (
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

                {loading ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="small" color={iconColor} />
                    </View>
                ) : filteredWraps.length === 0 ? (
                    <View style={styles.stateContainer}>
                        <ThemedText style={styles.emptyText}>No wraps available yet.</ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={filteredWraps}
                        numColumns={2}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.gridContent}
                        renderItem={renderWrapCard}
                        showsVerticalScrollIndicator={false}
                    />
                )}
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
    },
    stateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        opacity: 0.5,
        fontFamily: 'Manrope_400Regular',
    },
});
