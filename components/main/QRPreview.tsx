// QRPreview.tsx
import PreviewShield from "@/components/main/PreviewShield";
import { useRewarded } from "@/hooks/useRewards";
import { exportSvgQR } from "@/utils/exportAsSvg";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useRef, useState } from "react";
import { Alert, Button, Platform, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";

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
  const shotRef = useRef<View>(null);
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  const [protect, setProtect] = useState(true); // 🔒 프리뷰 보호 ON
  const { loaded, showFor } = useRewarded();

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

  return (
    <View style={{ alignItems: "center" }}>
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
                <Button title="내용을 입력하세요" onPress={() => {}} />
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={{ height: 12 }} />
      <Button title="로고 선택(내 이미지)" onPress={pickLogo} />
      <View style={{ height: 8 }} />
      <Button
        title="갤러리에 저장(광고 후)"
        disabled={!loaded}
        onPress={() =>
          showFor(saveToGallery).catch(() => Alert.alert("광고 오류"))
        }
      />
      <Button
        title="SVG로 내보내기"
        disabled={!loaded}
        onPress={() =>
          showFor(() => exportSvgQR({ value: safeValue, fg: fgColor })).catch(
            () => Alert.alert("광고 오류")
          )
        }
      />
    </View>
  );
}
