import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import React, { useState } from "react";
import useAuthStore from "@/store/auth.store";
import { User } from "@/store/auth.store";

const Profile = () => {
  const { user, isLoading, logoutUser, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name,
    bio: user?.bio,
  });

  const handleSave = async () => {
    if (formData.name && user) {
      // Only call updateUser if data has actually changed
      if (formData.name !== user.name || formData.bio !== user.bio) {
        await updateUser(formData);
      }
      setIsEditing(false);
    }
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
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      {/* Profile Section */}
      <View className="items-center mb-8">
        <Image
          source={{ uri: user.avatar }}
          className="w-24 h-24 rounded-full mb-4"
        />
        {isEditing ? (
          <TextInput
            className="text-2xl font-bold text-gray-800 text-center border-b border-gray-300 w-full mb-1"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        ) : (
          <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
        )}
        <Text className="text-gray-500">{user.email}</Text>
      </View>

      {/* Bio Section */}
      <View className="items-center mb-6">
        <Text className="text-gray-700 font-semibold mb-2">Bio</Text>
        {isEditing ? (
          <TextInput
            className="text-gray-600 text-center border border-gray-300 rounded-lg p-2 w-full"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            multiline
          />
        ) : (
          <Text className="text-gray-600 text-center italic">
            {user.bio || "No bio yet."}
          </Text>
        )}
      </View>

      {/* Account Info */}
      <View className="bg-gray-100 rounded-2xl p-4 mb-6">
        <Text className="text-gray-700 text-base">
          Account ID: {user.accountId}
        </Text>
      </View>

      {/* Edit and Save Buttons */}
      <TouchableOpacity
        className={`rounded-2xl p-4 items-center mb-4 ${
          isEditing ? "bg-green-500" : "bg-blue-500"
        }`}
        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
      >
        <Text className="text-white font-bold text-lg">
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        className="bg-red-500 rounded-2xl p-4 items-center"
        onPress={handleLogoutPress}
      >
        <Text className="text-white font-bold text-lg">Logout</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Confirm Logout
            </Text>
            <Text className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-200 rounded-lg py-2 px-4"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 rounded-lg py-2 px-4"
                onPress={confirmLogout}
              >
                <Text className="text-white font-semibold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;