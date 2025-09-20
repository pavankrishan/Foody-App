import { View, Text, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { updateUser } from '@/lib/appwrite'
import useAuthStore from '@/store/auth.store'
import { User } from '@/type'

const Profile = () => {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
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

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Please sign in to view your profile</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Profile Header */}
      <View className="items-center mb-8">
        <Image
          source={{ uri: user.avatar }}
          className="w-24 h-24 rounded-full mb-4"
        />
        
        {/* Name Field */}
        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Name</Text>
          {isEditing ? (
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-lg"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your name"
            />
          ) : (
            <Text className="text-xl font-bold text-center">{user.name}</Text>
          )}
        </View>

        {/* Bio Field */}
        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Bio</Text>
          {isEditing ? (
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text className="text-base text-gray-600 text-center">
              {user.bio || "No bio added yet"}
            </Text>
          )}
        </View>
      </View>

      {/* Email (Read-only) */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
        <Text className="text-base text-gray-600">{user.email}</Text>
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

      {/* Cancel Button (only visible when editing) */}
      {isEditing && (
        <TouchableOpacity
          className="rounded-2xl p-4 items-center bg-gray-500"
          onPress={() => {
            setIsEditing(false)
            setFormData({ name: user.name, bio: user.bio })
          }}
        >
          <Text className="text-white font-bold text-lg">Cancel</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

export default Profile