import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sugar_monitoring_profiles';
const AVATAR_VARIANT_COUNT = 4;

function buildInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getAvatarIdFromSeed(seed) {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return total % AVATAR_VARIANT_COUNT;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfiles() {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (!isMounted) {
          return;
        }

        if (storedValue) {
          const parsedProfiles = JSON.parse(storedValue);

          if (Array.isArray(parsedProfiles)) {
            const normalized = parsedProfiles.map((profile) => {
              const safeName = typeof profile?.name === 'string' ? profile.name : 'Profile';
              const initials = typeof profile?.initials === 'string' ? profile.initials : buildInitials(safeName) || 'P';
              const avatarId = Number.isFinite(profile?.avatarId)
                ? Math.abs(Math.floor(profile.avatarId)) % AVATAR_VARIANT_COUNT
                : getAvatarIdFromSeed(`${profile?.id || ''}-${safeName}`);
              const profileImageUri =
                typeof profile?.profileImageUri === 'string' && profile.profileImageUri.length > 0
                  ? profile.profileImageUri
                  : null;

              return {
                ...profile,
                name: safeName,
                initials,
                avatarId,
                profileImageUri,
              };
            });

            setProfiles(normalized);
          }
        }
      } catch (error) {
        console.warn('Failed to load local profiles', error);
      } finally {
        if (isMounted) {
          hasHydrated.current = true;
          setIsReady(true);
        }
      }
    }

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles)).catch((error) => {
      console.warn('Failed to persist local profiles', error);
    });
  }, [profiles]);

  const addProfile = (name) => {
    setProfiles((currentProfiles) => {
      const nextNumber = currentProfiles.length + 1;
      const trimmedName = name.trim();
      const initials = buildInitials(trimmedName);

      return [
        ...currentProfiles,
        {
          id: `profile-${nextNumber}`,
          name: trimmedName,
          initials: initials || 'P',
          avatarId: getAvatarIdFromSeed(`profile-${nextNumber}-${trimmedName}`),
          profileImageUri: null,
        },
      ];
    });
  };

  const updateProfile = (profileId, payload) => {
    const updateData =
      typeof payload === 'string'
        ? { name: payload }
        : payload && typeof payload === 'object'
          ? payload
          : {};

    const nextName = typeof updateData.name === 'string' ? updateData.name.trim() : null;
    const hasNameUpdate = typeof nextName === 'string' && nextName.length > 0;
    const hasAvatarUpdate = Number.isFinite(updateData.avatarId);
    const hasImageUpdate = Object.prototype.hasOwnProperty.call(updateData, 'profileImageUri');
    const normalizedImageUri =
      typeof updateData.profileImageUri === 'string' && updateData.profileImageUri.length > 0
        ? updateData.profileImageUri
        : null;

    if (!hasNameUpdate && !hasAvatarUpdate && !hasImageUpdate) {
      return;
    }

    setProfiles((currentProfiles) =>
      currentProfiles.map((profile) => {
        if (profile.id !== profileId) {
          return profile;
        }

        return {
          ...profile,
          name: hasNameUpdate ? nextName : profile.name,
          initials: hasNameUpdate ? buildInitials(nextName) || profile.initials || 'P' : profile.initials,
          avatarId: hasAvatarUpdate
            ? Math.abs(Math.floor(updateData.avatarId)) % AVATAR_VARIANT_COUNT
            : profile.avatarId,
          profileImageUri: hasImageUpdate ? normalizedImageUri : profile.profileImageUri || null,
        };
      })
    );
  };

  const removeProfile = (profileId) => {
    setProfiles((currentProfiles) =>
      currentProfiles.filter((profile) => profile.id !== profileId)
    );
  };

  return {
    profiles,
    addProfile,
    updateProfile,
    removeProfile,
    isReady,
  };
}
