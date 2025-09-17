// src/components/main/TemplateLogoPicker.tsx
import type { LogoItem } from "@/constants/logos";
import { Asset } from "expo-asset";
import React, { useCallback, useMemo } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";

type Props = {
  items: LogoItem[];
  onPick: (uri: string) => void; // 선택 시 file:// URI
  itemSize?: number; // 기본 72
  itemGap?: number; // 기본 10
  snap?: boolean; // 스냅 스크롤 여부(기본 true)
};

async function toLocalUri(mod: any) {
  const asset = Asset.fromModule(mod);
  if (!asset.localUri) await asset.downloadAsync();
  return asset.localUri!;
}

export default function TemplateLogoPicker({
  items,
  onPick,
  itemSize = 40,
  itemGap = 10,
  snap = true,
}: Props) {
  const itemOuter = useMemo(() => itemSize + itemGap * 2, [itemSize, itemGap]);

  const renderItem = useCallback(
    ({ item }: { item: LogoItem }) => {
      return (
        <Pressable
          onPress={async () => {
            const uri = await toLocalUri(item.source);
            onPick(uri);
          }}
          style={{
            width: itemOuter,
            height: itemOuter,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: itemSize + 16,
              height: itemSize + 16,
              borderRadius: 12,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#eee",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              source={item.source}
              style={{
                width: itemSize,
                height: itemSize,
                resizeMode: "contain",
              }}
            />
            {item.premium && (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 10 }}>AD</Text>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [onPick, itemOuter, itemSize]
  );

  // 성능 최적화(스크롤 위치 계산)
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: itemOuter,
      offset: itemOuter * index,
      index,
    }),
    [itemOuter]
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
      ItemSeparatorComponent={() => <View style={{ width: itemGap }} />}
      getItemLayout={getItemLayout}
      // 스냅(아이템 단위로 착착 멈추게)
      snapToInterval={snap ? itemOuter : undefined}
      decelerationRate={snap ? "fast" : "normal"}
      snapToAlignment={snap ? "start" : undefined}
      // 아이템 좌우 여백이 있으니 오버스크롤 최소화
      bounces
    />
  );
}
