import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function useProfileImagePicker() {
  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo access to upload a profile image.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        shape: 'oval',
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) {
        return null;
      }

      const picked = result.assets[0];
      if (picked.base64) {
        const mime = picked.mimeType || 'image/jpeg';
        return `data:${mime};base64,${picked.base64}`;
      }

      return picked.uri || null;
    } catch (error) {
      console.warn('Failed to pick profile image', error);
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
      return null;
    }
  };

  return {
    pickImage,
  };
}
