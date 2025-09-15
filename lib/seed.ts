import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  categories: string;
  menuCustomizations: string[];
}

interface DummyData {
  categories: Category[];
  menuCustomizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(tableId: string): Promise<void> {
  const list = await databases.listDocuments(appwriteConfig.databaseId, tableId);
  if (list.total > 0) {
    await Promise.all(
      list.documents.map((doc) =>
        databases.deleteDocument(appwriteConfig.databaseId, tableId, doc.$id)
      )
    );
    console.log(`✅ Cleared ${list.total} docs from ${tableId}`);
  }
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);
  if (list.files.length > 0) {
    await Promise.all(
      list.files.map((file) =>
        storage.deleteFile(appwriteConfig.bucketId, file.$id)
      )
    );
    console.log(`✅ Cleared ${list.files.length} files`);
  }
}

async function uploadImageToStorage(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return imageUrl;

    const blob = await response.blob();
    const file = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      {
        url: imageUrl,
        name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
        type: blob.type || "image/jpeg",
      }
    );
    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
  } catch {
    return imageUrl;
  }
}

async function seed(): Promise<void> {
  try {
    console.log("🌱 Seeding started...");
    await clearAll(appwriteConfig.categoryId);
    await clearAll(appwriteConfig.customizationId);
    await clearAll(appwriteConfig.menuId);
    await clearStorage();

    // Create categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoryId,
        ID.unique(),
        cat
      );
      categoryMap[cat.name] = doc.$id;
    }

    // Create customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.menuCustomizations) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.customizationId,
        ID.unique(),
        cus
      );
      customizationMap[cus.name] = doc.$id;
    }

    // Create menu items (with menuCustomizations as an array of IDs)
    for (const item of data.menu) {
      const uploadedImage = await uploadImageToStorage(item.image_url);

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuId,
        ID.unique(),
        {
          ...item,
          image_url: uploadedImage,
          categories: categoryMap[item.categories] ?? null,
          menuCustomizations: item.menuCustomizations.map(
            (cusName) => customizationMap[cusName] ?? ""
          ),
        }
      );
    }

    console.log("✅ Seeding complete.");
  } catch (error) {
    console.error("❌ Failed to seed the database:", error);
  }
}

export default seed;
