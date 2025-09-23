import { appwriteConfig, getMenuItemById } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { MenuItem } from "@/type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const doc = await getMenuItemById(id!);
        if (!isMounted) return;
        setItem(doc as unknown as MenuItem);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Failed to load item");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const imageUrl = useMemo(() => {
    if (!item?.image_url) return undefined;
    return `${item.image_url}?project=${appwriteConfig.projectId}`;
  }, [item]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="paragraph-bold text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-5">
        <Text className="paragraph-bold text-red-500" numberOfLines={2}>{error || "Item not found"}</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="paragraph-bold text-primary">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-32">
        <View className="px-5 pt-5">
          <TouchableOpacity onPress={() => router.back()} className="mb-3">
            <Text className="paragraph-bold text-primary">Back</Text>
          </TouchableOpacity>
        </View>

        {imageUrl ? (
          <View className="items-center mt-2">
            <Image source={{ uri: imageUrl }} className="w-72 h-72" resizeMode="contain" />
          </View>
        ) : null}

        <View className="px-5 mt-5">
          <Text className="h2-bold text-dark-100" numberOfLines={2}>{item.name}</Text>
          <Text className="paragraph-semibold text-primary mt-1">${item.price.toFixed(2)}</Text>
          <Text className="body-regular text-gray-500 mt-3">{item.description}</Text>

          <View className="flex-row gap-x-5 mt-4">
            <View>
              <Text className="small-bold text-gray-400">Rating</Text>
              <Text className="paragraph-bold text-dark-100">{item.rating}</Text>
            </View>
            <View>
              <Text className="small-bold text-gray-400">Calories</Text>
              <Text className="paragraph-bold text-dark-100">{item.calories}</Text>
            </View>
            <View>
              <Text className="small-bold text-gray-400">Protein</Text>
              <Text className="paragraph-bold text-dark-100">{item.protein} g</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 py-4 border-t border-gray-100 bg-white absolute bottom-0 left-0 right-0">
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center"
          onPress={() => addItem({ id: item.$id, name: item.name, price: item.price, image_url: imageUrl || item.image_url, customizations: [] })}
        >
          <Text className="paragraph-bold text-white">Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


