import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MoreHorizontal, Share2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WeeklyWrapDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const iconColor = useThemeColor({}, 'icon');
    const accentColor = useThemeColor({ light: '#E5E7EB', dark: '#262626' }, 'background');
    const highlightColor = useThemeColor({}, 'text');

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={iconColor} />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <Share2 size={24} color={iconColor} style={{ marginRight: 16 }} />
                        <MoreHorizontal size={24} color={iconColor} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeIn.delay(200)} style={styles.titleSection}>
                        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                        <ThemedText type="title" style={styles.title}>Your week in perspective</ThemedText>
                        <ThemedText style={styles.dateRange}>October 14 — October 20</ThemedText>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.quoteSection}>
                        <ThemedText style={styles.quote}>
                            "Growth is not in the big leaps, but in the steady rhythm of showing up."
                        </ThemedText>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(600)} style={styles.contentSection}>
                        <ThemedText style={styles.bodyText}>
                            This week, you've shown <ThemedText style={[styles.highlight, { color: highlightColor }]}>remarkable consistency</ThemedText> in your creative pursuits. From the early morning deep focus sessions on Monday to the collaborative wins on Thursday, your narrative is one of steady growth and intentionality. You navigated the initial resistance of Tuesday with grace, turning a potential slump into a moment of <ThemedText style={[styles.highlight, { color: highlightColor }]}>restorative reflection</ThemedText>.
                        </ThemedText>

                        <View style={[styles.divider, { backgroundColor: accentColor }]} />

                        <View style={styles.themeSection}>
                            <ThemedText style={styles.sectionLabel}>CORE THEMES</ThemedText>
                            <View style={styles.tagContainer}>
                                {['Creative Flow', 'Deep Focus', 'Mindful Rest', 'Collaboration'].map((tag, i) => (
                                    <View key={i} style={[styles.tag, { borderColor: accentColor }]}>
                                        <ThemedText style={styles.tagText}>{tag}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: accentColor }]} />

                        <ThemedText style={styles.bodyText}>
                            The data suggests a <ThemedText style={[styles.highlight, { color: highlightColor }]}>shift towards higher energy levels</ThemedText> in the late afternoon, coinciding with your most impactful daily wins. You have successfully navigated the mid-week slump by prioritizing restorative breaks. This adjustment allowed you to finish the week with a surge of productivity that culminated in your "Major Project Milestone" on Friday afternoon.
                        </ThemedText>

                        <ThemedText style={styles.bodyText}>
                            Looking forward, your momentum is building around...
                        </ThemedText>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerActions: {
        flexDirection: 'row',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 60,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    accentBar: {
        width: 40,
        height: 2,
        borderRadius: 1,
        marginBottom: 20,
    },
    title: {
        fontSize: 42,
        textAlign: 'center',
        marginBottom: 12,
    },
    dateRange: {
        fontSize: 16,
        opacity: 0.5,
        fontFamily: 'Manrope_400Regular',
    },
    quoteSection: {
        marginBottom: 40,
    },
    quote: {
        fontSize: 18,
        opacity: 0.6,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 28,
        paddingHorizontal: 20,
    },
    contentSection: {
        gap: 24,
    },
    bodyText: {
        fontSize: 18,
        opacity: 0.8,
        lineHeight: 28,
        fontFamily: 'Manrope_400Regular',
    },
    highlight: {
        fontFamily: 'Manrope_600SemiBold',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    themeSection: {
        alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'Manrope_600SemiBold',
        opacity: 0.4,
        letterSpacing: 2,
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 14,
        fontFamily: 'Manrope_400Regular',
    }
});
