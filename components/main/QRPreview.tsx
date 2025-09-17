// QRPreview.tsx
import PreviewShield from "@/components/main/PreviewShield";
import { TEMPLATE_LOGOS } from "@/constants/logos";
import { useRewarded } from "@/hooks/useRewards";
import { exportSvgQR } from "@/utils/exportAsSvg";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Platform, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import TemplateLogoPicker from "./TemplateLogoPicker";

// const REWARDED_AD_UNIT_ID = Platform.select({
//   ios: "ca-app-pub-3780332868290454/7529297071",
//   android: "ca-app-pub-3780332868290454/1482763472",
// });

const REWARDED_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3780332868290454/1794093971",
  android: "ca-app-pub-3780332868290454/1482763472",
});

const QR_SIZE = 260;

export default function QRPreview({
  value,
  fgColor,
}: {
  value: string;
  fgColor: string;
}) {
  const { t } = useTranslation();
  const shotRef = useRef<View>(null);
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  const [protect, setProtect] = useState(true); // 🔒 프리뷰 보호 ON
  const { loaded, showFor } = useRewarded(
    "ca-app-pub-3780332868290454/1794093971"
  );

  const safeValue = String(value ?? "").trim();
  const canRender = safeValue.length > 0;

  async function pickLogo() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled && res.assets?.[0]?.uri) setLogoUri(res.assets[0].uri);
  }

  // 렌더 사이클을 보장하기 위한 유틸
  const nextFrame = () =>
    new Promise<void>((r) => requestAnimationFrame(() => r()));

  async function saveToGallery() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("권한 필요", "갤러리 저장 권한을 허용해주세요.");

    // 🔓 저장 직전 보호 해제 → 캡처 → 🔒 즉시 복구
    setProtect(false);
    await nextFrame();

    const uri = await captureRef(shotRef, { format: "png", quality: 1 });

    setProtect(true);

    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.createAlbumAsync("QR Codes", asset, false);
    Alert.alert("완료", "갤러리에 저장했어요.");
  }

  // async function handlePickPremium(resolveUri: () => Promise<string>) {
  //   try {
  //     await showFor(async () => {
  //       const uri = await resolveUri();
  //       setLogoUri(uri);
  //     });
  //   } catch {
  //     Alert.alert("광고 오류", "잠시 후 다시 시도해주세요.");
  //   }
  // }

  return (
    <View style={{ alignItems: "center", marginVertical: 20 }}>
      <View
        ref={shotRef}
        collapsable={false}
        style={{ padding: 16, backgroundColor: "#ffffff" }}
      >
        <View style={{ width: QR_SIZE, height: QR_SIZE }}>
          {canRender ? (
            <>
              <QRCode
                value={safeValue}
                size={QR_SIZE}
                color={fgColor}
                backgroundColor={"#ffffff"}
                logo={logoUri}
                logoSize={56}
                logoBackgroundColor="transparent"
                ecl="H"
              />
              {/* 🔒 프리뷰 보호 오버레이 */}
              <PreviewShield
                width={QR_SIZE}
                height={QR_SIZE}
                active={protect}
                text="PREVIEW"
              />
            </>
          ) : (
            <View
              style={{
                width: QR_SIZE,
                height: QR_SIZE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ opacity: 0.6 }}>
                <Button title={t("index.inputValue")} onPress={() => {}} />
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={{ marginVertical: 15 }}>
        <Text style={{ color: "#666" }}>{t("index.protectPreview")}</Text>
      </View>
      <TemplateLogoPicker
        items={TEMPLATE_LOGOS}
        onPick={(uri) => setLogoUri(uri)}
        //  onPickPremium={(resolver) => handlePickPremium(resolver)}
      />
      <Button title={t("index.selectMyLogo")} onPress={pickLogo} />
      <View style={{ height: 8 }} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          title={t("index.saveToGallery")}
          onPress={() => showFor(saveToGallery).catch(() => saveToGallery())}
        />
        <Button
          title={t("index.exportAsSvg")}
          onPress={() =>
            showFor(() => exportSvgQR({ value: safeValue, fg: fgColor })).catch(
              () => exportSvgQR({ value: safeValue, fg: fgColor })
            )
          }
        />
      </View>
    </View>
  );
}
