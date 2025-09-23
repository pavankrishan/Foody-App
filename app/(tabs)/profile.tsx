import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  const { user, isLoading, logoutUser, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name,
    bio: user?.bio,
  });

  // Sync formData whenever user updates
  useEffect(() => {
    setFormData({ name: user?.name, bio: user?.bio });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = (formData.name || "").trim();
    if (!trimmedName) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert("Validation", "Name must be at least 2 characters.");
      return;
    }

    // Only update if data changed
    if (trimmedName === user.name && (formData.bio || "") === (user.bio || "")) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // Attempt to save bio too (API will gracefully fallback if unsupported)
      await updateUser({ name: trimmedName, bio: formData.bio ?? "" });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user?.name, bio: user?.bio });
    setIsEditing(false);
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logoutUser();
    setShowLogoutModal(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-lg text-gray-700 font-semibold text-center">
          No user data found. Please log in.
        </Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 rounded-lg px-4 py-2"
          onPress={() => console.log("Navigate to Login")}
        >
          <Text className="text-white font-semibold text-center">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-8 pb-4 border-b border-gray-100 bg-white">
        <Text className="h2-bold text-dark-100">Profile</Text>
        <Text className="text-gray-400 mt-1">Manage your account details</Text>
      </View>

      <View className="p-6">
        {/* Profile Section */}
        <View className="items-center mb-8">
          <View className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-100">
            <Image
              source={{
                uri: user.avatar || `https://ui-avatars.com/api/?name=${user.name}`,
              }}
              className="w-full h-full"
            />
          </View>

          {isEditing ? (
            <TextInput
              className="text-2xl font-bold text-gray-800 text-center border-b border-gray-300 w-full mb-1"
              value={formData.name ?? ""}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your name"
              maxLength={60}
            />
          ) : (
            <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
          )}
          <Text className="text-gray-500 mt-1">{user.email}</Text>
        </View>

        {/* Bio Section */}
        <View className="mb-6 w-full">
          <Text className="text-gray-700 font-semibold mb-2">Bio</Text>
          {isEditing ? (
            <TextInput
              className="text-gray-600 border border-gray-300 rounded-2xl p-3 w-full min-h-20"
              value={formData.bio ?? ""}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              placeholder="Write something about yourself..."
              maxLength={240}
            />
          ) : (
            <Text className="text-gray-600">
              {user.bio || "No bio yet."}
            </Text>
          )}
        </View>

        {/* Account Info */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6 w-full">
          <Text className="text-gray-700 text-base">Account ID</Text>
          <Text className="paragraph-bold text-dark-100 mt-1" numberOfLines={1}>
            {user.accountId}
          </Text>
        </View>

        {/* Actions */}
        {isEditing ? (
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              disabled={isSaving}
              className={`flex-1 rounded-2xl p-4 items-center bg-green-500 ${isSaving ? "opacity-50" : ""}`}
              onPress={handleSave}
            >
              <Text className="text-white font-bold text-lg">{isSaving ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isSaving}
              className={`flex-1 rounded-2xl p-4 items-center bg-gray-200 ${isSaving ? "opacity-50" : ""}`}
              onPress={handleCancel}
            >
              <Text className="text-gray-800 font-bold text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="rounded-2xl p-4 items-center mb-4 bg-primary"
            onPress={() => setIsEditing(true)}
          >
            <Text className="text-white font-bold text-lg">Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="bg-red-500 rounded-2xl p-4 items-center mt-2"
          onPress={handleLogoutPress}
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-80 shadow-lg">
            <Text className="text-lg font-bold text-gray-800 mb-2">Confirm Logout</Text>
            <Text className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </Text>
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-xl py-3 px-4 items-center"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-xl py-3 px-4 items-center"
                onPress={confirmLogout}
              >
                <Text className="text-white font-semibold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isSaving && (
        <View className="absolute inset-0 bg-black/10 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

export default Profile;
