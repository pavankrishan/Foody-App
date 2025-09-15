import { CATEGORIES } from "@/constants";
import { CreateUserParams, SignInParams,GetMenuParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.kp.foody",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "68c6a4dd00223b4edd20",
  bucketId:"68c80f8b0030d47b9475",
  tableId: "user", // ✅ using Tables API
  categoryId:"categories",
  menuId:"menu",
  customizationId:"customizations",
  menuCustomizationId:"menu_customizations"
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage =  new Storage(client)
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
  try {
    // 1. Create account
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Account creation failed");

    // 2. Sign in user
    await signIn({ email, password });

    // 3. Generate avatar
    const avatarUrl = avatars.getInitialsURL(name);

    // 4. Store user data in table
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tableId, // ✅ using tableId correctly
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl,
      }
    );
  } catch (e: any) {
    throw new Error(`Failed to create user: ${e.message || e}`);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    throw new Error(`Failed to sign in: ${e.message || e}`);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No current account");

    // ✅ Correct listDocuments call using tableId
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.tableId,
      [Query.equal("accountId", currentAccount.$id)] // ✅ fixed spelling
    );

    if (!currentUser || currentUser.total === 0)
      throw new Error("User not found in database");

    return currentUser.documents[0];
  } catch (e: any) {
    console.log("getCurrentUser error:", e);
    throw new Error(e.message || e);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: any[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuId, // ✅ point to menu collection, not user table
      queries
    );

    return menus.documents;
  } catch (e: any) {
    console.error("getMenu error:", e);
    throw new Error(e.message || "Failed to fetch menu");
  }
};


export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoryId // ✅ use the categories collection
    );

    return categories.documents; // ✅ return the array of categories
  } catch (e: any) {
    console.error("getCategories error:", e);
    throw new Error(e.message || "Failed to fetch categories");
  }
};
