import { ThemedText } from "@/components/themed-text";
import { db } from "@/config/firebase.config";
import { collection, doc, getDocs } from "firebase/firestore";

import React from "react";
import { FlatList, View } from "react-native";
import { useState, useEffect } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

const Timeline = () => {
  const startYear = 2026;
  const numberOfYears = 50;

  const listOfYears2026Above = Array.from(
    { length: numberOfYears },
    (_, index) => startYear + index,
  );

  const [achievmentList, setAchievements] = useState([]);
  useEffect(() => {
    const fetchAchievements = async () => {
      const achievementsRef = collection(db, "achievements");
      const snapshot = await getDocs(achievementsRef);

      const achievements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAchievements(achievements);
    };

    fetchAchievements();
  }, []);
  return (
    <SafeAreaView
      style={{
        flexDirection: "column",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingVertical: 80,
      }}
    >
      <View>
        <ThemedText type="title">Timeline</ThemedText>
        <ThemedText type="subtitle">
          A quite chronicle of your progress, curated by your daily wins.
        </ThemedText>
      </View>
      <View
        style={{
          width: "100%",
          marginTop: 40,
        }}
      >
        <FlatList
          data={achievmentList}
          renderItem={({ item }) => (
            <View>
              <ThemedText type="subtitle">{item.achievement}</ThemedText>
              <ThemedText type="subtitle">{item.date}</ThemedText>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </SafeAreaView>
  );
};

export default Timeline;
