import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function PaymentScreen() {
  const { url } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!url) router.back(); // no url? go back
  }, [url]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {url && (
        <WebView
          source={{ uri: String(url) }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
        />
      )}
    </SafeAreaView>
  );
}
