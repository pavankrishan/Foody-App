import { CreateUserParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.kp.foody",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "68c6a4dd00223b4edd20",
  tableId: "user", // ✅ using Tables API
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
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
