import { useThemeColor } from '@/hooks/use-theme-color';
import { eachMonthOfInterval, format, subMonths } from 'date-fns';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface ContributionData {
    date: string;
    count: number;
}

interface ContributionGraphProps {
    data: ContributionData[];
    type?: 'weekly' | 'monthly';
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ data, type = 'monthly' }) => {
    const processedData = useMemo(() => {
        if (data && data.length > 0) return data;

        // Generate 30 days of mock data
        const mockData: ContributionData[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            mockData.push({
                date: date.toISOString().split('T')[0],
                count: Math.random() > 0.5 ? 1 : 0, // Binary mock data
            });
        }
        return mockData;
    }, [data]);

    const emptyCellColor = useThemeColor({ light: '#F3F4F6', dark: '#262626' }, 'background');
    const loggedCellColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

    // Labels for months
    const monthLabels = useMemo(() => {
        const end = new Date();
        const start = subMonths(end, 1);
        const months = eachMonthOfInterval({ start, end });
        return months.map(m => format(m, 'MMM'));
    }, []);

    const renderCell = (item: ContributionData, index: number) => {
        return (
            <View key={item.date} style={styles.cellWrapper}>
                <Animated.View
                    entering={FadeIn.delay(index * 20)}
                    style={[
                        styles.cell,
                        { backgroundColor: item.count > 0 ? loggedCellColor : emptyCellColor }
                    ]}
                />
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.monthLabels}>
                    {monthLabels.map((label, i) => (
                        <ThemedText key={i} style={styles.label}>{label}</ThemedText>
                    ))}
                    <ThemedText style={styles.label}>{format(new Date(), 'yyyy')}</ThemedText>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gridContainer}
            >
                <View style={styles.grid}>
                    {processedData.map(renderCell)}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <ThemedText style={styles.footerText}>Flow status indication</ThemedText>
                <View style={styles.legend}>
                    <View style={[styles.legendCell, { backgroundColor: emptyCellColor }]} />
                    <ThemedText style={styles.legendText}>Empty</ThemedText>
                    <View style={[styles.legendCell, { backgroundColor: loggedCellColor }]} />
                    <ThemedText style={styles.legendText}>Logged</ThemedText>
                </View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.1)',
    },
    header: {
        marginBottom: 16,
    },
    monthLabels: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        opacity: 0.6,
        fontFamily: 'Manrope_600SemiBold',
    },
    gridContainer: {
        paddingVertical: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: 80,
        width: 400,
        gap: 6,
    },
    cellWrapper: {
        // Ensuring consistent spacing
    },
    cell: {
        width: 14,
        height: 14,
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    footerText: {
        fontSize: 10,
        opacity: 0.4,
        fontFamily: 'Manrope_400Regular',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendText: {
        fontSize: 10,
        opacity: 0.6,
        fontFamily: 'Manrope_400Regular',
    },
    legendCell: {
        width: 8,
        height: 8,
        borderRadius: 2,
    }
});
