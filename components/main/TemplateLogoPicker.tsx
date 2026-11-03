// src/components/main/TemplateLogoPicker.tsx
import Card from "@/components/ui/Card";
import { TEMPLATE_LOGOS } from "@/constants/logos";
import { colors, radius, spacing } from "@/constants/theme";
import { useQREditor } from "@/context/QREditorContext";
import { useLayoutMode } from "@/hooks/useLayoutMode";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ITEM_SIZE = 56;

function LogoTile({
  selected,
  onPress,
  label,
  accessibilityLabel,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.tileWrapper}
    >
      <View style={[styles.tile, selected && styles.tileSelected]}>
        {children}
        {selected && (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
          </View>
        )}
      </View>
      {label && (
        <Text
          style={[styles.tileLabel, selected && styles.tileLabelSelected]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/** 로고 선택: 없음 / 템플릿 / 내 이미지 */
export default function TemplateLogoPicker() {
  const { t } = useTranslation();
  const { logo, setLogo } = useQREditor();
  const { isRegular } = useLayoutMode();

  async function pickCustomLogo() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setLogo({ type: "custom", uri: res.assets[0].uri });
      }
    } catch (e) {
      console.warn("[TemplateLogoPicker] failed to pick image", e);
    }
  }

  const customSelected = logo?.type === "custom";
  const customSource: ImageSourcePropType | undefined =
    logo?.type === "custom" ? { uri: logo.uri } : undefined;

  const tiles = (
    <>
      <LogoTile
        selected={logo === null}
        onPress={() => setLogo(null)}
        label={t("index.noLogo")}
      >
        <Ionicons name="ban-outline" size={26} color={colors.textTertiary} />
      </LogoTile>

      <LogoTile
        selected={customSelected}
        onPress={pickCustomLogo}
        label={t("index.selectMyLogo")}
      >
        {customSource ? (
          <Image source={customSource} style={styles.logoImage} />
        ) : (
          <Ionicons name="add" size={28} color={colors.primary} />
        )}
      </LogoTile>

      {TEMPLATE_LOGOS.map((item) => (
        <LogoTile
          key={item.id}
          selected={logo?.type === "template" && logo.id === item.id}
          onPress={() => setLogo({ type: "template", id: item.id })}
          accessibilityLabel={item.id}
        >
          <Image source={item.source} style={styles.logoImage} />
        </LogoTile>
      ))}
    </>
  );

  return (
    <Card title={t("index.section.logo")} icon="image-outline">
      {isRegular ? (
        // 넓은 창(iPad/Mac): 줄바꿈해서 모든 로고를 한눈에
        <View style={[styles.list, styles.wrap]}>{tiles}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {tiles}
        </ScrollView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingRight: spacing.xs,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.md,
  },
  tileWrapper: {
    alignItems: "center",
    gap: 6,
    width: ITEM_SIZE + 8,
  },
  tile: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  tileSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
  },
  logoImage: {
    width: ITEM_SIZE - 18,
    height: ITEM_SIZE - 18,
    resizeMode: "contain",
    borderRadius: 6,
  },
  check: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  tileLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tileLabelSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});
