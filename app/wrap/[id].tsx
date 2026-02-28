import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getWrapById, WrapDoc } from "@/services/wraps.service";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MoreHorizontal, Share2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WrapDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [wrap, setWrap] = useState<WrapDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const iconColor = useThemeColor({}, "icon");
  const accentColor = useThemeColor(
    { light: "#E5E7EB", dark: "#262626" },
    "background",
  );
  const highlightColor = useThemeColor({}, "text");

  useEffect(() => {
    let mounted = true;

    const loadWrap = async () => {
      if (!id || typeof id !== "string") {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getWrapById(id);
        if (mounted) setWrap(data);
      } catch (error) {
        console.error("Error fetching wrap:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWrap();
    return () => {
      mounted = false;
    };
  }, [id]);

  const title = useMemo(() => {
    if (!wrap) return "Your wrap in perspective";
    return wrap.periodType === "monthly"
      ? "Your month in perspective"
      : "Your week in perspective";
  }, [wrap]);

  const dateRange = useMemo(() => {
    if (!wrap?.rangeStart || !wrap?.rangeEnd) return "";
    return `${format(new Date(wrap.rangeStart), "MMMM dd")} - ${format(new Date(wrap.rangeEnd), "MMMM dd")}`;
  }, [wrap]);

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

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={iconColor} />
          </View>
        ) : !wrap ? (
          <View style={styles.stateContainer}>
            <ThemedText style={styles.emptyText}>Wrap not found.</ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {wrap.imageUrl ? (
              <Animated.View entering={FadeIn.delay(150)}>
                <Image source={{ uri: wrap.imageUrl }} style={styles.heroImage} />
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeIn.delay(200)} style={styles.titleSection}>
              <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
              <ThemedText type="title" style={styles.title}>
                {title}
              </ThemedText>
              <ThemedText style={styles.dateRange}>{dateRange}</ThemedText>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.quoteSection}>
              <ThemedText style={styles.quote}>
                {wrap.quote || `"${wrap.theme}"`}
              </ThemedText>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600)} style={styles.contentSection}>
              <ThemedText style={styles.bodyText}>{wrap.narrative}</ThemedText>

              <View style={[styles.divider, { backgroundColor: accentColor }]} />

              <View style={styles.themeSection}>
                <ThemedText style={styles.sectionLabel}>CORE THEMES</ThemedText>
                <View style={styles.tagContainer}>
                  {(wrap.tags || []).map((tag, i) => (
                    <View key={i} style={[styles.tag, { borderColor: accentColor }]}>
                      <ThemedText style={styles.tagText}>{tag}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: accentColor }]} />

              <ThemedText style={styles.bodyText}>
                <ThemedText style={[styles.highlight, { color: highlightColor }]}>
                  {wrap.winsCount}
                </ThemedText>{" "}
                wins were logged during this period. The pattern reflects steady
                momentum anchored in small, repeatable actions.
              </ThemedText>
            </Animated.View>
          </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerActions: {
    flexDirection: "row",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    marginBottom: 24,
  },
  titleSection: {
    alignItems: "center",
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
    textAlign: "center",
    marginBottom: 12,
  },
  dateRange: {
    fontSize: 16,
    opacity: 0.5,
    fontFamily: "Manrope_400Regular",
  },
  quoteSection: {
    marginBottom: 40,
  },
  quote: {
    fontSize: 18,
    opacity: 0.6,
    textAlign: "center",
    fontStyle: "italic",
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
    fontFamily: "Manrope_400Regular",
  },
  highlight: {
    fontFamily: "Manrope_600SemiBold",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  themeSection: {
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    opacity: 0.4,
    letterSpacing: 2,
    marginBottom: 20,
    textTransform: "uppercase",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
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
    fontFamily: "Manrope_400Regular",
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    opacity: 0.5,
    fontFamily: "Manrope_400Regular",
  },
});
