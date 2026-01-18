import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "captions";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "captions" ? styles.captions : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "PPEditorial",
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "PPEditorial",
  },
  title: {
    fontSize: 38,
    lineHeight: 40,
    fontFamily: "PPEditorial",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Manrope_400Regular",
  },
  captions: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Manrope_400Regular",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,

    fontFamily: "Manrope_400Regular",
  },
});
