// QRPreview.tsx (Expo)
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useRef, useState } from "react";
import { Alert, Button, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";

type Props = {
  value: string; // URL or WIFI payload
  fgColor: string; // 전경색
  bgColor: string; // 배경색
};

export default function QRPreview({ value, fgColor, bgColor }: Props) {
  const shotRef = useRef<View>(null);
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);

  const safeValue = String(value ?? "").trim();
  const canRender = safeValue.length > 0;

  async function pickLogo() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled && res.assets?.[0]?.uri) setLogoUri(res.assets[0].uri);
  }

  async function saveToGallery() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("권한 필요", "갤러리 저장 권한을 허용해주세요.");

    const uri = await captureRef(shotRef, { format: "png", quality: 1 });
    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.createAlbumAsync("QR Codes", asset, false);
    Alert.alert("완료", "갤러리에 저장했어요.");
  }

  return (
    <View style={{ alignItems: "center" }}>
      <View
        ref={shotRef}
        collapsable={false}
        style={{ padding: 16, backgroundColor: bgColor }}
      >
        {canRender ? (
          <QRCode
            value={safeValue}
            size={260}
            color={fgColor}
            backgroundColor={bgColor}
            logo={logoUri}
            logoSize={56}
            logoBackgroundColor="transparent"
            ecl="H"
          />
        ) : (
          // 비어 있을 때 플레이스홀더
          <View
            style={{
              width: 260,
              height: 260,
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

      <View style={{ height: 12 }} />
      <Button title="로고 선택(내 이미지)" onPress={pickLogo} />
      {/* 광고 개방 로고는 별도 그리드로 보여주고, 잠금/광고 배지 표시 */}
      <View style={{ height: 8 }} />
      <Button title="갤러리에 저장(광고 후)" onPress={saveToGallery} />
    </View>
  );
}
