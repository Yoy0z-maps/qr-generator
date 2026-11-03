import PreviewShield from "@/components/main/PreviewShield";
import { SOURCE_MODE_ICONS } from "@/components/main/SourceTypeSelector";
import StyledQRCode from "@/components/main/StyledQRCode";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { PREVIEW_PROTECTION_ENABLED } from "@/constants/ads";
import { colors, radius, spacing } from "@/constants/theme";
import { useHistory } from "@/context/HistoryContext";
import { useQREditor } from "@/context/QREditorContext";
import {
  BREAKPOINTS,
  MAX_CONTENT_WIDTH,
  useLayoutMode,
} from "@/hooks/useLayoutMode";
import { HistoryEntry } from "@/types/qr";
import { getLogoSource } from "@/utils/logo";
import { summarizeForm } from "@/utils/qrPayload";
import { createQRMatrix } from "@/utils/qrMatrix";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const THUMB_SIZE = 64;

function HistoryItem({
  entry,
  onOpen,
  onToggleFavorite,
  onDelete,
}: {
  entry: HistoryEntry;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const { t, i18n } = useTranslation();
  const matrix = useMemo(() => createQRMatrix(entry.value, "H"), [entry.value]);
  const summary = summarizeForm(entry.mode, entry.form) || entry.value;
  const date = new Date(entry.createdAt).toLocaleString(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityHint={t("history.openHint")}
    >
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: entry.style.transparentBg
              ? colors.inputBackground
              : entry.style.bgColor,
          },
        ]}
      >
        {matrix && (
          <StyledQRCode
            matrix={matrix}
            size={THUMB_SIZE}
            qrStyle={entry.style}
            logo={getLogoSource(entry.logo)}
          />
        )}
        {PREVIEW_PROTECTION_ENABLED && (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <PreviewShield width={THUMB_SIZE} height={THUMB_SIZE} active text="" />
          </View>
        )}
      </View>

      <View style={styles.itemBody}>
        <View style={styles.typeRow}>
          <Ionicons
            name={SOURCE_MODE_ICONS[entry.mode]}
            size={13}
            color={colors.primary}
          />
          <Text style={styles.typeLabel}>{t(`index.type.${entry.mode}`)}</Text>
        </View>
        <Text style={styles.summary} numberOfLines={1}>
          {summary}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            entry.favorite ? t("index.removeFavorite") : t("index.addFavorite")
          }
        >
          <Ionicons
            name={entry.favorite ? "star" : "star-outline"}
            size={22}
            color={entry.favorite ? colors.favorite : colors.textTertiary}
          />
        </Pressable>
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("history.delete")}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textTertiary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function History() {
  const { t } = useTranslation();
  const { entries, toggleFavorite, remove, clearRecent } = useHistory();
  const { loadEntry } = useQREditor();
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const { width } = useLayoutMode();

  // 넓은 창(iPad/Mac)에서는 카드 그리드로 표시
  const numColumns =
    width >= BREAKPOINTS.wide ? 3 : width >= BREAKPOINTS.regular ? 2 : 1;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - spacing.lg * 2;
  const itemWidth =
    (contentWidth - spacing.md * (numColumns - 1)) / numColumns;

  const data =
    filter === "favorites" ? entries.filter((e) => e.favorite) : entries;
  const hasRecent = entries.some((e) => !e.favorite);

  const confirmClear = () => {
    Alert.alert(t("history.clearTitle"), t("history.clearMessage"), [
      { text: t("index.cancel"), style: "cancel" },
      { text: t("history.clear"), style: "destructive", onPress: clearRecent },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.toolbar, styles.contentWidth]}>
        {/* 넓은 창에서는 필터가 화면 끝까지 늘어나지 않도록 너비 제한 */}
        <View style={[styles.flex, numColumns > 1 && styles.filterRegular]}>
          <SegmentedControl
            options={[
              { value: "all", label: t("history.all"), icon: "time-outline" },
              { value: "favorites", label: t("history.favorites"), icon: "star-outline" },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </View>
        {hasRecent && (
          <Pressable
            onPress={confirmClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("history.clear")}
            style={styles.clearButton}
          >
            <Ionicons name="trash-bin-outline" size={20} color={colors.danger} />
          </Pressable>
        )}
      </View>

      <FlatList
        // numColumns는 렌더 중 바뀔 수 없어서 열 수가 바뀌면 다시 마운트
        key={`cols-${numColumns}`}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        data={data}
        keyExtractor={(e) => e.id}
        style={styles.contentWidth}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={numColumns > 1 ? { width: itemWidth } : undefined}>
            <HistoryItem
              entry={item}
              onOpen={() => {
                loadEntry(item);
                router.navigate("/");
              }}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onDelete={() => remove(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={filter === "favorites" ? "star-outline" : "time-outline"}
              size={44}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyText}>
              {filter === "favorites"
                ? t("history.emptyFavorites")
                : t("history.empty")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWidth: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  filterRegular: {
    maxWidth: 360,
    marginRight: "auto",
  },
  columnWrapper: {
    gap: spacing.md,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  flex: {
    flex: 1,
  },
  clearButton: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  summary: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  actions: {
    alignItems: "center",
    gap: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: 80,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
