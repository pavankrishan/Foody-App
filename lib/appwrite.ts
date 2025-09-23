import { CreateUserParams, GetMenuParams, SignInParams, User } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.kp.foody",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "68c6a4dd00223b4edd20",
  bucketId: "68c80f8b0030d47b9475",
  tableId: "user", 
  categoryId: "categories",
  menuId: "menu",
  customizationId: "customizations",
  menuCustomizationId: "menu_customizations"
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

// ✅ Create User
export const createUser = async ({ email, password, name }: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Account creation failed");

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tableId,
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

// ✅ Sign In User (creates session)
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    throw new Error(`Failed to sign in: ${e.message || e}`);
  }
};

// ✅ Sign Out User (removes current session)
export const signOut = async () => {
  try {
    await account.deleteSession("current");
    console.log("User signed out successfully");
    return true;
  } catch (e: any) {
    console.error("signOut error:", e);
    return false;
  }
};

// ✅ Get Current Authenticated User
export const getCurrentUser = async () => {
  try {
    const sessions = await account.listSessions();
    if (!sessions || sessions.total === 0) {
      console.log("No active session found");
      return null;
    }

    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.tableId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.total === 0) {
      console.log("User not found in database");
      return null;
    }

    return currentUser.documents[0];
  } catch (e: any) {
    console.log("getCurrentUser error:", e);
    return null;
  }
};

// ✅ Fetch Menu Items
export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: any[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuId,
      queries
    );

    return menus.documents;
  } catch (e: any) {
    console.error("getMenu error:", e);
    throw new Error(e.message || "Failed to fetch menu");
  }
};

// ✅ Get single Menu Item by id
export const getMenuItemById = async (id: string) => {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuId,
      id
    );
    return doc;
  } catch (e: any) {
    console.error("getMenuItemById error:", e);
    throw new Error(e.message || "Failed to fetch menu item");
  }
};

// ✅ Fetch Categories
export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoryId
    );

    return categories.documents;
  } catch (e: any) {
    console.error("getCategories error:", e);
    throw new Error(e.message || "Failed to fetch categories");
  }
};

export const updateUser = async (
  userData: Partial<{ name: string; bio: string }>
): Promise<User> => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No current account");

    // Get the current user document
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.tableId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.total === 0)
      throw new Error("User not found in database");

    const userDoc = currentUser.documents[0];

    // Try sending both fields if provided; fallback if schema doesn't support bio
    const primaryPayload: { name?: string; bio?: string } = {};
    if (typeof userData.name === "string") primaryPayload.name = userData.name;
    if (typeof userData.bio === "string") primaryPayload.bio = userData.bio;

    try {
      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tableId,
        userDoc.$id,
        primaryPayload
      );
      return updatedUser as unknown as User;
    } catch (err: any) {
      const message = String(err?.message || err);
      const unknownAttr = message.includes("Unknown attribute");
      const relatesToBio = message.includes("bio");
      if (unknownAttr && relatesToBio) {
        const fallbackPayload: { name?: string } = {};
        if (typeof userData.name === "string") fallbackPayload.name = userData.name;

        const updatedUser = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.tableId,
          userDoc.$id,
          fallbackPayload
        );
        return updatedUser as unknown as User;
      }
      throw err;
    }
  } catch (e: any) {
    console.error("updateUser error:", e);
    throw new Error(e.message || "Failed to update user");
  }
};
