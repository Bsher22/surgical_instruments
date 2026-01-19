// src/components/profile/ProfileHeader.tsx
// User profile header with avatar, name, and basic info

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { UserProfile, UserRole } from '../../types/user';
import { USER_ROLES, getRoleBadgeColor, getInitials } from '../../types/user';
import { useSettingsStore } from '../../stores/settingsStore';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditPress: () => void;
  onAvatarPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditPress,
  onAvatarPress,
}) => {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  
  const initials = useMemo(() => getInitials(profile.full_name), [profile.full_name]);
  const roleBadgeColor = useMemo(() => getRoleBadgeColor(profile.role), [profile.role]);
  
  const handleEditPress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEditPress();
  };
  
  const handleAvatarPress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAvatarPress?.();
  };
  
  return (
    <View style={styles.container}>
      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditPress}
        activeOpacity={0.7}
      >
        <Ionicons name="pencil" size={18} color="#6366F1" />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      
      {/* Avatar */}
      <Pressable
        onPress={onAvatarPress ? handleAvatarPress : undefined}
        style={({ pressed }) => [
          styles.avatarContainer,
          pressed && onAvatarPress && styles.avatarPressed,
        ]}
      >
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        {onAvatarPress && (
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={12} color="#FFF" />
          </View>
        )}
      </Pressable>
      
      {/* Name */}
      <Text style={styles.name}>{profile.full_name}</Text>
      
      {/* Email */}
      <Text style={styles.email}>{profile.email}</Text>
      
      {/* Role Badge */}
      <View style={[styles.roleBadge, { backgroundColor: roleBadgeColor }]}>
        <Text style={styles.roleBadgeText}>
          {USER_ROLES[profile.role] || profile.role}
        </Text>
      </View>
      
      {/* Institution */}
      {profile.institution && (
        <View style={styles.institutionContainer}>
          <Ionicons name="business-outline" size={14} color="#6B7280" />
          <Text style={styles.institution}>{profile.institution}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPressed: {
    opacity: 0.8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  institutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  institution: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ProfileHeader;
