import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ContributionGraph } from "@/components/ui/contribution-graph";
import { db } from "@/config/firebase.config";
import { useAuth } from "@/context/auth.context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { format } from "date-fns";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Filter, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Timeline = () => {
  const { user } = useAuth();
  const [achievementList, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const iconColor = useThemeColor({}, 'icon');
  const dotColor = useThemeColor({}, 'text');
  const lineColor = useThemeColor({ light: '#E5E7EB', dark: '#262626' }, 'background');
  const buttonBg = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const buttonText = useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'background');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const achievementsRef = collection(db, "achievements");
        const q = query(achievementsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const achievements = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure date is a Date object or formatted string
          displayDate: doc.data().date?.toDate ? format(doc.data().date.toDate(), "MMM dd, yyyy") : "No Date"
        }));

        setAchievements(achievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const renderTimelineItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100)}
      style={styles.timelineItem}
    >
      <View style={styles.timelineLineContainer}>
        <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
        {index !== achievementList.length - 1 && <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />}
      </View>
      <View style={styles.timelineContent}>
        <ThemedText style={styles.itemDate}>{item.displayDate}</ThemedText>
        <TouchableOpacity style={styles.itemCard}>
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.achievementImage}
              resizeMode="cover"
            />
          )}
          <ThemedText type="title" style={styles.achievementText}>{item?.achievement}</ThemedText>
          {item.category && (
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <ThemedText type="title" style={styles.title}>Timeline</ThemedText>
              <ThemedText style={styles.subtitle}>
                A quiet chronicle of your progress, curated by your daily wins.
              </ThemedText>
            </View>
            <TouchableOpacity style={[styles.filterButton, { borderColor: lineColor }]}>
              <Filter size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <Animated.View entering={FadeInRight.delay(300)}>
            <ContributionGraph data={[]} type="monthly" />
          </Animated.View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Daily Wins</ThemedText>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: buttonBg }]}>
              <Plus size={20} color={buttonText} />
              <ThemedText style={[styles.addButtonText, { color: buttonText }]}>Add Win</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineList}>
            {achievementList.length > 0 ? (
              achievementList.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderTimelineItem({ item, index })}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>No wins yet. Start your journey today.</ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    fontFamily: 'Manrope_400Regular',
    maxWidth: '85%',
    lineHeight: 24,
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Manrope_600SemiBold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
  timelineList: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLineContainer: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
    marginTop: 4,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginTop: 4,
    marginBottom: -12,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 20,
    paddingBottom: 40,
  },
  itemDate: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    opacity: 0.5,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: 'transparent',
  },
  achievementImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
  },
  achievementText: {
    fontSize: 22,
    lineHeight: 30,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  categoryText: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'Manrope_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    opacity: 0.4,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  }
});

export default Timeline;
