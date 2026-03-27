import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

const PROFILES_PAGE_SIZE = 5;

const FACE_THEMES = [
  {
    skin: '#fde68a',
    hair: '#1f2937',
    shirt: '#6ee7b7',
    accent: '#0f2f24',
    tile: '#166534',
    icon: 'leaf-circle-outline',
  },
  {
    skin: '#fdba74',
    hair: '#7c2d12',
    shirt: '#34d399',
    accent: '#144e3b',
    tile: '#15803d',
    icon: 'leaf-circle-outline',
  },
  {
    skin: '#f9a8d4',
    hair: '#111827',
    shirt: '#86efac',
    accent: '#14532d',
    tile: '#16a34a',
    icon: 'sprout-outline',
  },
  {
    skin: '#fcd34d',
    hair: '#0f172a',
    shirt: '#a7f3d0',
    accent: '#134e4a',
    tile: '#22c55e',
    icon: 'water-outline',
  },
];

function getFaceTheme(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return FACE_THEMES[Math.abs(Math.floor(seed)) % FACE_THEMES.length];
  }

  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return FACE_THEMES[total % FACE_THEMES.length];
}

function FaceAvatar({ seed, imageUri }) {
  const theme = getFaceTheme(seed);

  if (imageUri) {
    return (
      <View style={styles.avatarInner}>
        <Image source={{ uri: imageUri }} style={styles.faceImage} />
      </View>
    );
  }

  return (
    <View style={[styles.avatarInner, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
      <View style={[styles.faceHair, { backgroundColor: theme.hair }]} />
      <View style={[styles.faceHead, { backgroundColor: theme.skin }]}>
        <View style={styles.faceEyesRow}>
          <View style={styles.faceEye} />
          <View style={styles.faceEye} />
        </View>
        <View style={styles.faceSmile} />
      </View>
      <View style={[styles.faceBody, { backgroundColor: theme.shirt }]} />
    </View>
  );
}

function ProfileCard({
  name,
  initials,
  seed,
  avatarId,
  imageUri,
  onPress,
  tileSize,
  labelSize,
  metaSize,
  iconSize,
}) {
  const theme = getFaceTheme(Number.isFinite(avatarId) ? avatarId : seed);
  const avatarFrameSize = Math.round(tileSize * 0.58);
  const avatarInnerSize = Math.round(tileSize * 0.46);

  return (
    <Pressable style={[styles.profileCard, { width: tileSize }]} onPress={onPress}>
      <View style={[styles.profileTile, { backgroundColor: theme.tile, width: tileSize, height: tileSize }]}>
        <View style={styles.profileIconBadge}>
          <MaterialCommunityIcons name={theme.icon} size={iconSize} color="#ffffff" />
        </View>
        <View
          style={[
            styles.avatarWrap,
            {
              backgroundColor: theme.accent,
              width: avatarFrameSize,
              height: avatarFrameSize,
              borderRadius: avatarFrameSize / 2,
            },
          ]}
        >
          <View
            style={[
              styles.avatarScaleWrap,
              {
                width: avatarInnerSize,
                height: avatarInnerSize,
              },
            ]}
          >
            <FaceAvatar seed={Number.isFinite(avatarId) ? avatarId : seed} imageUri={imageUri} />
          </View>
        </View>
      </View>
      <Text style={[styles.profileLabel, { fontSize: labelSize }]} numberOfLines={1}>
        {name}
      </Text>
      {/* <Text style={[styles.profileMeta, { fontSize: metaSize }]}>{initials}</Text> */}
    </Pressable>
  );
}

function AddProfileCard({ onPress, tileSize, labelSize, hintSize, plusSize }) {
  return (
    <Pressable style={[styles.addCard, { width: tileSize }]} onPress={onPress}>
      <View style={[styles.addTile, { width: tileSize, height: tileSize }]}>
        <Ionicons name="add" size={plusSize} color="#86efac" />
      </View>
      <Text style={[styles.addLabel, { fontSize: labelSize }]}>Add profile</Text>
      <Text style={[styles.addHint, { fontSize: hintSize }]}>Saved on this device</Text>
    </Pressable>
  );
}

function FloatingAddButton({ onPress, bottomOffset = 28 }) {
  return (
    <Pressable style={[styles.floatingButton, { bottom: bottomOffset }]} onPress={onPress}>
      <Ionicons name="add" size={28} color="#ffffff" />
    </Pressable>
  );
}

function FloatingRemoveButton({ onPress, bottomOffset = 28 }) {
  return (
    <Pressable style={[styles.floatingRemoveButton, { bottom: bottomOffset }]} onPress={onPress}>
      <Ionicons name="close" size={26} color="#ffffff" />
    </Pressable>
  );
}

export function ProfilesScreen({ profiles, onAddProfile, onRemoveProfile, onSelectProfile }) {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [deletePage, setDeletePage] = React.useState(0);
  const [pendingDeleteProfile, setPendingDeleteProfile] = React.useState(null);
  const [profileName, setProfileName] = React.useState('');
  const { width, height } = useWindowDimensions();

  const isNarrow = width < 520;
  const horizontalPadding = isNarrow ? 16 : 24;
  const heroMaxWidth = Math.min(width - horizontalPadding * 2, 980);
  const tileSize = isNarrow ? Math.min(150, width * 0.38) : 168;
  const titleSize = isNarrow ? 32 : 44;
  const subtitleSize = isNarrow ? 14 : 16;
  const labelSize = isNarrow ? 18 : 24;
  const metaSize = isNarrow ? 11 : 13;
  const hintSize = isNarrow ? 11 : 13;
  const plusSize = isNarrow ? 40 : 48;
  const iconSize = isNarrow ? 14 : 16;
  const gridGap = isNarrow ? 18 : 28;
  const topPadding = isNarrow ? 28 : 48;
  const bottomPadding = isNarrow ? 28 : 48;
  const floatingButtonsBottom = isNarrow
    ? (Platform.OS === 'android' ? 92 : 88)
    : (Platform.OS === 'android' ? 64 : 54);

  const openModal = () => setIsModalVisible(true);
  const openDeleteModal = () => {
    setDeletePage(0);
    setIsDeleteModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
    setProfileName('');
  };
  const closeDeleteModal = () => setIsDeleteModalVisible(false);

  const handleCreateProfile = () => {
    const trimmedName = profileName.trim();

    if (!trimmedName) {
      return;
    }

    onAddProfile(trimmedName);
    closeModal();
  };

  const totalDeletePages = Math.max(1, Math.ceil(profiles.length / PROFILES_PAGE_SIZE));
  const currentDeletePage = Math.min(deletePage, totalDeletePages - 1);
  const deleteStartIndex = currentDeletePage * PROFILES_PAGE_SIZE;
  const pagedProfiles = profiles.slice(deleteStartIndex, deleteStartIndex + PROFILES_PAGE_SIZE);

  React.useEffect(() => {
    const maxPage = Math.max(0, totalDeletePages - 1);
    if (deletePage > maxPage) {
      setDeletePage(maxPage);
    }
  }, [deletePage, totalDeletePages]);

  const handleRemoveProfile = (profileId) => {
    if (typeof onRemoveProfile === 'function') {
      onRemoveProfile(profileId);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundLayer} />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
            minHeight: height,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { maxWidth: heroMaxWidth }]}>
          <Text style={styles.eyebrow}>Sugar Monitoring App</Text>
          <Text style={[styles.title, { fontSize: titleSize }]}>Who&apos;s monitoring today?</Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: subtitleSize * 1.5 }]}>
            Profiles are stored locally on this device, so users can jump back in next time
            without any cloud setup.
          </Text>

          {profiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No profiles yet</Text>
              <Text style={styles.emptyText}>
                Create your first local profile to enter the app.
              </Text>
            </View>
          ) : null}

          <View style={[styles.grid, { gap: gridGap, marginTop: isNarrow ? 32 : 42 }]}>
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                name={profile.name}
                initials={profile.initials}
                seed={`${profile.id}-${profile.name}`}
                avatarId={profile.avatarId}
                imageUri={profile.profileImageUri}
                onPress={() => onSelectProfile(profile)}
                tileSize={tileSize}
                labelSize={labelSize}
                metaSize={metaSize}
                iconSize={iconSize}
              />
            ))}
            {profiles.length === 0 ? (
              <AddProfileCard
                onPress={openModal}
                tileSize={tileSize}
                labelSize={labelSize}
                hintSize={hintSize}
                plusSize={plusSize}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      {profiles.length > 0 ? (
        <FloatingRemoveButton onPress={openDeleteModal} bottomOffset={floatingButtonsBottom} />
      ) : null}
      {profiles.length > 0 ? (
        <FloatingAddButton onPress={openModal} bottomOffset={floatingButtonsBottom} />
      ) : null}

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="person-add-outline" size={22} color="#ffffff" />
              </View>
              <Text style={styles.modalTitle}>Create profile</Text>
            </View>
            <Text style={styles.modalText}>
              This profile is saved locally on the device and will be available when the app
              opens again.
            </Text>
            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Enter profile name"
              placeholderTextColor="#64748b"
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryAction} onPress={closeModal}>
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryAction} onPress={handleCreateProfile}>
                <Text style={styles.primaryActionText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isDeleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, styles.deleteModalIconWrap]}>
                <Ionicons name="trash-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.modalTitle}>Delete profiles</Text>
            </View>
            <Text style={styles.modalText}>
              Select a profile to remove. Showing 5 at a time.
            </Text>

            <View style={styles.deleteListWrap}>
              {pagedProfiles.map((profile) => (
                <View key={profile.id} style={styles.deleteListItem}>
                  <View style={styles.deleteProfileInfo}>
                    <View style={styles.deleteAvatarWrap}>
                      {profile.profileImageUri ? (
                        <Image source={{ uri: profile.profileImageUri }} style={styles.deleteAvatarImage} />
                      ) : (
                        <Text style={styles.deleteAvatarText}>{profile.initials}</Text>
                      )}
                    </View>
                    <Text style={styles.deleteName} numberOfLines={1}>
                      {profile.name}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.deleteActionButton}
                    onPress={() => setPendingDeleteProfile(profile)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.paginationRow}>
              <Pressable
                style={[
                  styles.paginationButton,
                  currentDeletePage === 0 ? styles.paginationButtonDisabled : null,
                ]}
                onPress={() => setDeletePage((page) => Math.max(0, page - 1))}
                disabled={currentDeletePage === 0}
              >
                <Text style={styles.paginationButtonText}>Prev</Text>
              </Pressable>
              <Text style={styles.paginationText}>
                Page {currentDeletePage + 1} / {totalDeletePages}
              </Text>
              <Pressable
                style={[
                  styles.paginationButton,
                  currentDeletePage >= totalDeletePages - 1 ? styles.paginationButtonDisabled : null,
                ]}
                onPress={() => setDeletePage((page) => Math.min(totalDeletePages - 1, page + 1))}
                disabled={currentDeletePage >= totalDeletePages - 1}
              >
                <Text style={styles.paginationButtonText}>Next</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryAction} onPress={closeDeleteModal}>
                <Text style={styles.secondaryActionText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(pendingDeleteProfile)}
        onRequestClose={() => setPendingDeleteProfile(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.confirmDeleteCard]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, styles.deleteModalIconWrap]}>
                <Ionicons name="warning-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.modalTitle}>Confirm delete</Text>
            </View>
            <Text style={styles.modalText}>
              Remove{' '}
              <Text style={styles.confirmProfileName}>
                {pendingDeleteProfile?.name || 'this profile'}
              </Text>{' '}
              and all its local glucose logs?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.secondaryAction}
                onPress={() => setPendingDeleteProfile(null)}
              >
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.dangerAction}
                onPress={() => {
                  if (pendingDeleteProfile?.id) {
                    handleRemoveProfile(pendingDeleteProfile.id);
                  }
                  setPendingDeleteProfile(null);
                }}
              >
                <Text style={styles.primaryActionText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#04140d',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#04140d',
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.16)',
  },
  glowBottom: {
    position: 'absolute',
    right: -120,
    bottom: -100,
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.14)',
  },
  content: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
  },
  hero: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#6ee7b7',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 14,
    color: '#f8fafc',
    fontSize: 44,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    color: '#a7f3d0',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 640,
    textAlign: 'center',
  },
  emptyState: {
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.28)',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 4,
    color: '#a7f3d0',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  profileCard: {
    alignItems: 'center',
  },
  profileTile: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileIconBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  avatarWrap: {
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarScaleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 74,
    height: 74,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  faceHair: {
    position: 'absolute',
    top: 8,
    width: 48,
    height: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  faceHead: {
    position: 'absolute',
    top: 18,
    width: 34,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
  },
  faceEyesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  faceEye: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#0f172a',
  },
  faceSmile: {
    marginTop: 7,
    width: 12,
    height: 6,
    borderBottomWidth: 2,
    borderColor: '#0f172a',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  faceBody: {
    position: 'absolute',
    bottom: -6,
    width: 46,
    height: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  profileLabel: {
    marginTop: 16,
    color: '#e5e7eb',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileMeta: {
    marginTop: 6,
    color: '#86efac',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  addCard: {
    alignItems: 'center',
  },
  addTile: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#062014',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#22c55e',
  },
  addLabel: {
    marginTop: 16,
    color: '#dcfce7',
    fontSize: 24,
    fontWeight: '700',
  },
  addHint: {
    marginTop: 6,
    color: '#86efac',
    fontSize: 13,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    shadowColor: '#22c55e',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  floatingRemoveButton: {
    position: 'absolute',
    left: 24,
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(2, 20, 12, 0.75)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#0a1f15',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.25)',
  },
  confirmDeleteCard: {
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
  },
  deleteModalIconWrap: {
    backgroundColor: '#dc2626',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  modalText: {
    marginTop: 10,
    color: '#a7f3d0',
    fontSize: 15,
    lineHeight: 22,
  },
  confirmProfileName: {
    color: '#fef08a',
    fontWeight: '800',
  },
  input: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1b5e3b',
    color: '#f8fafc',
    fontSize: 16,
    backgroundColor: '#0b2a1d',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  deleteListWrap: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1b5e3b',
    overflow: 'hidden',
  },
  deleteListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0b2a1d',
    borderBottomWidth: 1,
    borderBottomColor: '#164e33',
  },
  deleteProfileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  deleteAvatarWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#14532d',
    borderWidth: 1,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  deleteAvatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteAvatarText: {
    color: '#dcfce7',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deleteName: {
    color: '#dcfce7',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  deleteActionButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
  },
  paginationRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#164e33',
  },
  paginationButtonDisabled: {
    opacity: 0.45,
  },
  paginationButtonText: {
    color: '#dcfce7',
    fontSize: 12,
    fontWeight: '700',
  },
  paginationText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#164e33',
  },
  secondaryActionText: {
    color: '#dcfce7',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#16a34a',
  },
  dangerAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#dc2626',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
