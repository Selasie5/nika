import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { db, storage } from "@/config/firebase.config";
import { useAuth } from "@/context/auth.context";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera, Image as ImageIcon, Send, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const Home = () => {
  const [achievement, setAchievement] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayWins, setTodayWins] = useState<any[]>([]);
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const currentDate = new Date();
  const textColor = useThemeColor({}, "text");
  const inputBg = useThemeColor(
    { light: "#F3F4F6", dark: "#171717" },
    "background",
  );
  const accentColor = useThemeColor(
    { light: "#000000", dark: "#FFFFFF" },
    "text",
  );
  const bubbleBg = useThemeColor(
    { light: "#E5E7EB", dark: "#262626" },
    "background",
  );

  useEffect(() => {
    if (!user) return;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "achievements"),
      where("userId", "==", user.uid),
      where("date", ">=", startOfDay.toISOString()),
      orderBy("date", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wins = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTodayWins(wins);
      // Faster scroll to bottom
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
    );
    return () => keyboardDidShowListener.remove();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `achievements/${user?.uid}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!achievement.trim() && !image) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      await addDoc(collection(db, "achievements"), {
        achievement: achievement.trim(),
        image: imageUrl,
        date: new Date().toISOString(),
        userId: user?.uid,
      });

      setAchievement("");
      setImage(null);
      router.push("/success");
    } catch (error) {
      console.error("Error adding achievement: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTodayWin = (win: any, index: number) => (
    <Animated.View
      key={win.id}
      entering={FadeInUp.springify()}
      layout={Layout.springify()}
      style={[styles.winBubble, { backgroundColor: bubbleBg }]}
    >
      {win.image && (
        <Image
          source={{ uri: win.image }}
          style={styles.winImage}
          resizeMode="cover"
        />
      )}
      {win.achievement ? (
        <ThemedText style={styles.winText}>{win.achievement}</ThemedText>
      ) : null}
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: todayWins.length > 0 ? 20 : 100 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <ThemedText style={styles.dateLabel}>
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </ThemedText>
              <ThemedText type="title" style={styles.title}>
                Today's Wins
              </ThemedText>
            </View>

            {todayWins.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No wins logged yet today. What's one thing you're proud of?
                </ThemedText>
              </View>
            ) : (
              <View style={styles.winsList}>
                {todayWins.map((win, i) => renderTodayWin(win, i))}
              </View>
            )}
          </ScrollView>

          {/* Chat-style Input Bar */}
          <View
            style={[
              styles.inputWrapper,
              {
                borderTopColor: inputBg,
                backgroundColor: useThemeColor(
                  { light: "#FFFFFF", dark: "#000000" },
                  "background",
                ),
              },
            ]}
          >
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setImage(null)}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputInner}>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                  <ImageIcon size={22} color={textColor} opacity={0.6} />
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={styles.iconButton}>
                  <Camera size={22} color={textColor} opacity={0.6} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.input,
                  { color: textColor, backgroundColor: inputBg },
                ]}
                placeholder="Log your win..."
                placeholderTextColor="#999999"
                value={achievement}
                onChangeText={setAchievement}
                multiline
                onContentSizeChange={() =>
                  scrollViewRef.current?.scrollToEnd({ animated: true })
                }
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || (!achievement.trim() && !image)}
                style={[
                  styles.sendButton,
                  { backgroundColor: accentColor },
                  (loading || (!achievement.trim() && !image)) && {
                    opacity: 0.3,
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={useThemeColor(
                      { light: "#FFF", dark: "#000" },
                      "background",
                    )}
                  />
                ) : (
                  <Send
                    size={20}
                    color={useThemeColor(
                      { light: "#FFF", dark: "#000" },
                      "background",
                    )}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 38,
    fontFamily: "PPEditorial",
  },
  dateLabel: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: "Manrope_600SemiBold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  greeting: {
    fontSize: 28,
  },
  winsList: {
    gap: 16,
    paddingBottom: 20,
  },
  winBubble: {
    padding: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  winImage: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 12,
    marginBottom: 8,
  },
  winText: {
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    lineHeight: 22,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 20,
    opacity: 0.4,
    textAlign: "left",
    lineHeight: 24,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 12 : 12,
  },
  imagePreviewContainer: {
    marginBottom: 12,
    flexDirection: "row",
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  removeImage: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  inputInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 2,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Home;
