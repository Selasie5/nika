import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

const Input = ({
  label,
  placeholder,
  secureTextEntry = false,
  type,
  onChangeText,
  onBlur,
  value,
  leftIcon,
  rightIcon,
  onRightIconPress,
}: {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  type: "email" | "password" | "text" | "number";
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  value?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View
      style={{
        flexDirection: "column",
        gap: 12,
        paddingVertical: 12,
        width: "100%",
      }}
    >
      <ThemedText type="subtitle">{label}</ThemedText>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 12,
        }}
      >
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color="#888"
            style={{ marginRight: 8 }}
          />
        )}

        <TextInput
          placeholder={placeholder}
          secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
          keyboardType={
            type === "email"
              ? "email-address"
              : type === "number"
                ? "numeric"
                : "default"
          }
          style={{
            flex: 1,
            paddingVertical: 16,
            fontSize: 16,
          }}
          onChangeText={onChangeText}
          onBlur={onBlur}
          value={value}
        />

        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <MaterialIcons
              name={isPasswordVisible ? "visibility" : "visibility-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <MaterialIcons name={rightIcon} size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Input;
