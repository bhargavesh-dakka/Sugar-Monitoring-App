import React from 'react';
import { Ionicons } from '@expo/vector-icons';
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
import { WeeklyReminderCard } from './WeeklyReminderCard';
import { useProfileImagePicker } from '../hooks/useProfileImagePicker';
import { useWeeklyReminder } from '../hooks/useWeeklyReminder';

const TREND_DAYS = 7;
const AVATAR_CHOICES = [
  { tile: '#166534', accent: '#0f2f24', skin: '#fde68a', shirt: '#6ee7b7', hair: '#1f2937' },
  { tile: '#15803d', accent: '#144e3b', skin: '#fdba74', shirt: '#34d399', hair: '#7c2d12' },
  { tile: '#16a34a', accent: '#14532d', skin: '#f9a8d4', shirt: '#86efac', hair: '#111827' },
  { tile: '#22c55e', accent: '#134e4a', skin: '#fcd34d', shirt: '#a7f3d0', hair: '#0f172a' },
];

function parseLogDate(log) {
  const date = new Date(log.takenAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function average(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function formatAvg(value) {
  if (value === null) {
    return '--';
  }

  return `${Math.round(value)} mg/dL`;
}

function formatShort(value) {
  if (value === null) {
    return '--';
  }

  return `${Math.round(value)}`;
}

function getDayKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildTrendRows(logs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const seedRows = [];
  for (let i = TREND_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = `${date.getFullYear()}`;

    seedRows.push({
      key: getDayKey(date),
      shortLabel: `${date.getDate()}/${date.getMonth() + 1}`,
      fullLabel: `${day}/${month}/${year}`,
      preValues: [],
      postValues: [],
    });
  }

  const rowMap = Object.fromEntries(seedRows.map((row) => [row.key, row]));

  logs.forEach((log) => {
    const date = parseLogDate(log);
    if (!date) {
      return;
    }

    date.setHours(0, 0, 0, 0);
    const key = getDayKey(date);
    const row = rowMap[key];
    if (!row) {
      return;
    }

    const value = Number(log.value);
    if (!Number.isFinite(value)) {
      return;
    }

    if (log.mealTag === 'post') {
      row.postValues.push(value);
    } else {
      row.preValues.push(value);
    }
  });

  return seedRows.map((row) => ({
    key: row.key,
    shortLabel: row.shortLabel,
    fullLabel: row.fullLabel,
    preAvg: average(row.preValues),
    postAvg: average(row.postValues),
  }));
}

function KpiCard({ title, value, hint, icon, color, width }) {
  return (
    <View style={[styles.kpiCard, { width }]}> 
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIconBubble, { backgroundColor: color }]}>
          <Ionicons name={icon} size={13} color="#ffffff" />
        </View>
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiHint}>{hint}</Text>
    </View>
  );
}

function TrendLinesChart({ rows }) {
  const [chartWidth, setChartWidth] = React.useState(0);
  const chartHeight = 128;

  const preValues = rows.map((row) => row.preAvg).filter((value) => value !== null);
  const postValues = rows.map((row) => row.postAvg).filter((value) => value !== null);
  const allValues = [...preValues, ...postValues];

  if (!allValues.length) {
    return (
      <View style={styles.chartEmpty}>
        <Text style={styles.chartEmptyText}>No trend data yet. Start logging glucose.</Text>
      </View>
    );
  }

  const min = Math.min(...allValues, 70);
  const max = Math.max(...allValues, 180);
  const range = Math.max(max - min, 1);
  const yTop = Math.round(max);
  const yMid = Math.round(min + range / 2);
  const yBottom = Math.round(min);
  const stepX = rows.length > 1 ? chartWidth / (rows.length - 1) : chartWidth;

  const createPoints = (key) =>
    rows.map((row, index) => {
      const value = row[key];
      if (value === null) {
        return null;
      }

      return {
        x: index * stepX,
        y: chartHeight - ((value - min) / range) * chartHeight,
        value,
        key: `${key}-${row.key}`,
      };
    });

  const prePoints = createPoints('preAvg');
  const postPoints = createPoints('postAvg');

  const renderLineSegments = (points, color) => {
    const segments = [];

    for (let i = 0; i < points.length - 1; i += 1) {
      const first = points[i];
      const second = points[i + 1];

      if (!first || !second) {
        continue;
      }

      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      segments.push(
        <View
          key={`seg-${color}-${i}`}
          style={[
            styles.lineSegment,
            {
              left: first.x,
              top: first.y,
              width: length,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />
      );
    }

    return segments;
  };

  const renderDots = (points, color) =>
    points
      .filter(Boolean)
      .map((point) => (
        <View
          key={`dot-${point.key}`}
          style={[
            styles.lineDot,
            {
              left: point.x - 4,
              top: point.y - 4,
              backgroundColor: color,
            },
          ]}
        />
      ));

  return (
    <View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Pre meal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Post meal</Text>
        </View>
      </View>

      <View style={styles.axisCaptionRow}>
        <Text style={styles.axisCaption}>Y-axis: Glucose (mg/dL)</Text>
        <Text style={styles.axisCaption}>X-axis: Date</Text>
      </View>
      <View style={styles.chartArea}>
        <View style={styles.yAxisColumn}>
          <Text style={styles.yAxisLabel}>{yTop}</Text>
          <Text style={styles.yAxisLabel}>{yMid}</Text>
          <Text style={styles.yAxisLabel}>{yBottom}</Text>
        </View>

        <View style={styles.chartMain}>
          <View
            style={styles.chartCanvas}
            onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
          >
            <View style={styles.gridLineTop} />
            <View style={styles.gridLineMid} />
            <View style={styles.gridLineBottom} />

            {chartWidth > 0 ? renderLineSegments(prePoints, '#10b981') : null}
            {chartWidth > 0 ? renderLineSegments(postPoints, '#3b82f6') : null}
            {chartWidth > 0 ? renderDots(prePoints, '#10b981') : null}
            {chartWidth > 0 ? renderDots(postPoints, '#3b82f6') : null}
          </View>

          <View style={styles.xLabelsRow}>
            {rows.map((row) => (
              <Text key={row.key} style={styles.xLabelText}>
                {row.shortLabel}
              </Text>
            ))}
          </View>
          <Text style={styles.xAxisTitle}>Date</Text>
        </View>
      </View>
    </View>
  );
}

function TrendTable({ rows }) {
  return (
    <View style={styles.tableWrap}>
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        <Text style={[styles.tableCell, styles.tableHeaderText]}>Date</Text>
        <Text style={[styles.tableCell, styles.tableHeaderText]}>Pre Avg</Text>
        <Text style={[styles.tableCell, styles.tableHeaderText]}>Post Avg</Text>
      </View>
      {rows.map((row) => (
        <View key={row.key} style={styles.tableRow}>
          <Text style={styles.tableCell}>{row.fullLabel}</Text>
          <Text style={styles.tableCell}>{row.preAvg === null ? '--' : Math.round(row.preAvg)}</Text>
          <Text style={styles.tableCell}>{row.postAvg === null ? '--' : Math.round(row.postAvg)}</Text>
        </View>
      ))}
    </View>
  );
}

export function ProfileDashboardScreen({
  profile,
  logs,
  onLogGlucose,
  onBack,
  onUpdateProfile,
}) {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [valueInput, setValueInput] = React.useState('');
  const [profileNameInput, setProfileNameInput] = React.useState(profile?.name || '');
  const [avatarIdInput, setAvatarIdInput] = React.useState(
    Number.isFinite(profile?.avatarId) ? profile.avatarId : 0
  );
  const [profileImageUriInput, setProfileImageUriInput] = React.useState(profile?.profileImageUri || null);
  const [mealTag, setMealTag] = React.useState('pre');
  const { width } = useWindowDimensions();
  const { isReminderVisible, dismissReminder } = useWeeklyReminder(profile?.id);
  const { pickImage } = useProfileImagePicker();

  const values = logs
    .map((log) => Number(log.value))
    .filter((value) => Number.isFinite(value));
  const preValues = logs
    .filter((log) => log.mealTag !== 'post')
    .map((log) => Number(log.value))
    .filter((value) => Number.isFinite(value));
  const postValues = logs
    .filter((log) => log.mealTag === 'post')
    .map((log) => Number(log.value))
    .filter((value) => Number.isFinite(value));

  const avgSugar = average(values);
  const preAvg = average(preValues);
  const postAvg = average(postValues);
  const trendRows = buildTrendRows(logs);

  const shellWidth = Math.max(width - 24, 280);
  const fabBottomOffset =
    width < 430
      ? (Platform.OS === 'android' ? 88 : 74)
      : (Platform.OS === 'android' ? 56 : 44);

  React.useEffect(() => {
    setProfileNameInput(profile?.name || '');
    setAvatarIdInput(Number.isFinite(profile?.avatarId) ? profile.avatarId : 0);
    setProfileImageUriInput(profile?.profileImageUri || null);
  }, [profile?.avatarId, profile?.name, profile?.profileImageUri]);

  const submitLog = () => {
    const value = Number.parseInt(valueInput, 10);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    onLogGlucose({
      value,
      mealTag,
      takenAt: new Date().toISOString(),
    });

    setValueInput('');
    setMealTag('pre');
    setIsModalVisible(false);
    dismissReminder();
  };

  const openEditProfile = () => {
    setIsMenuVisible(false);
    setProfileNameInput(profile?.name || '');
    setAvatarIdInput(Number.isFinite(profile?.avatarId) ? profile.avatarId : 0);
    setProfileImageUriInput(profile?.profileImageUri || null);
    setIsEditModalVisible(true);
  };

  const handleUploadProfileImage = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setProfileImageUriInput(imageUri);
    }
  };

  const submitProfileEdit = () => {
    const trimmedName = profileNameInput.trim();
    if (!trimmedName) {
      return;
    }

    if (typeof onUpdateProfile === 'function') {
      onUpdateProfile(profile.id, {
        name: trimmedName,
        avatarId: avatarIdInput,
        profileImageUri: profileImageUriInput,
      });
    }

    setIsEditModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bgOrbOne} />
      <View style={styles.bgOrbTwo} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.dashboardShell, { width: shellWidth }]}> 
          <View style={styles.headerRow}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <Ionicons name="chevron-back" size={16} color="#111827" />
              <Text style={styles.backText}>Profiles</Text>
            </Pressable>
            <View style={styles.headerActions}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{profile.name}</Text>
              </View>
              <Pressable style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
                <Ionicons name="menu" size={18} color="#0f172a" />
              </Pressable>
            </View>
          </View>

          <Text style={styles.headerTitle}>Glucose Dashboard</Text>
          {/* <Text style={styles.headerSubtitle}>2 key KPIs + pre/post trend tracking</Text> */}

          {isReminderVisible ? (
            <WeeklyReminderCard
              onLater={dismissReminder}
              onLogNow={() => {
                setIsModalVisible(true);
                dismissReminder();
              }}
            />
          ) : null}

          <View style={styles.kpiRow}>
            <KpiCard
              title="Avg Sugar"
              value={formatAvg(avgSugar)}
              hint="Overall glucose average"
              icon="pulse-outline"
              color="#22c55e"
              width="49%"
            />
            <KpiCard
              title="Pre/Post Avg"
              value={`${formatShort(preAvg)} / ${formatShort(postAvg)} mg/dL`}
              hint="Pre meal / Post meal"
              icon="restaurant-outline"
              color="#f97316"
              width="49%"
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Sugar Trend (Pre vs Post Meal)</Text>
            <TrendLinesChart rows={trendRows} />
            <TrendTable rows={trendRows} />
          </View>
        </View>
      </ScrollView>

      <Pressable style={[styles.fab, { bottom: fabBottomOffset }]} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add" size={22} color="#ffffff" />
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setIsMenuVisible(false)}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <Pressable style={styles.menuItem} onPress={openEditProfile}>
              <Ionicons name="create-outline" size={16} color="#0f172a" />
              <Text style={styles.menuItemText}>Edit profile</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log glucose</Text>
            <TextInput
              value={valueInput}
              onChangeText={setValueInput}
              keyboardType="numeric"
              placeholder="Enter glucose value (mg/dL)"
              placeholderTextColor="#64748b"
              style={styles.input}
            />
            <View style={styles.mealRow}>
              <Pressable
                style={[styles.mealChip, mealTag === 'pre' ? styles.mealChipActive : null]}
                onPress={() => setMealTag('pre')}
              >
                <Text style={[styles.mealChipText, mealTag === 'pre' ? styles.mealChipTextActive : null]}>
                  Pre Meal
                </Text>
              </Pressable>
              <Pressable
                style={[styles.mealChip, mealTag === 'post' ? styles.mealChipActive : null]}
                onPress={() => setMealTag('post')}
              >
                <Text style={[styles.mealChipText, mealTag === 'post' ? styles.mealChipTextActive : null]}>
                  Post Meal
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryAction} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryAction} onPress={submitLog}>
                <Text style={styles.primaryActionText}>Save Log</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <TextInput
              value={profileNameInput}
              onChangeText={setProfileNameInput}
              placeholder="Profile name"
              placeholderTextColor="#64748b"
              style={styles.input}
              autoFocus
            />
            <Text style={styles.editSectionTitle}>Profile image</Text>
            <View style={styles.imageActionRow}>
              <Pressable style={styles.uploadImageAction} onPress={handleUploadProfileImage}>
                <Ionicons name="image-outline" size={14} color="#065f46" />
                <Text style={styles.uploadImageActionText}>Upload</Text>
              </Pressable>
              {profileImageUriInput ? (
                <Pressable
                  style={styles.clearImageAction}
                  onPress={() => setProfileImageUriInput(null)}
                >
                  <Ionicons name="close-circle-outline" size={14} color="#991b1b" />
                  <Text style={styles.clearImageActionText}>Remove image</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.uploadPreviewCard}>
              {profileImageUriInput ? (
                <Image source={{ uri: profileImageUriInput }} style={styles.uploadPreviewImage} />
              ) : (
                <Text style={styles.uploadPreviewHint}>No uploaded image. Using vector avatar.</Text>
              )}
            </View>
            

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryAction} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryAction} onPress={submitProfileEdit}>
                <Text style={styles.primaryActionText}>Save</Text>
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
    overflow: 'hidden',
    backgroundColor: '#dcefe6',
  },
  bgOrbOne: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(52,211,153,0.2)',
  },
  bgOrbTwo: {
    position: 'absolute',
    bottom: 80,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.14)',
  },
  content: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 120,
    alignItems: 'center',
  },
  dashboardShell: {
    alignSelf: 'center',
    gap: 10,
    maxWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  backText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  headerBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#b9e8d4',
  },
  headerBadgeText: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '700',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  headerTitle: {
    marginTop: 4,
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 1,
    color: '#475569',
    fontSize: 10,
  },
  kpiRow: {
    width: '100%',
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  kpiCard: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kpiIconBubble: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  kpiValue: {
    marginTop: 6,
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  kpiHint: {
    marginTop: 2,
    color: '#64748b',
    fontSize: 10,
  },
  chartCard: {
    width: '100%',
    borderRadius: 16,
    padding: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chartTitle: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  chartEmpty: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f1f5f9',
  },
  chartEmptyText: {
    color: '#64748b',
    fontSize: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  axisCaptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  axisCaption: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  yAxisColumn: {
    width: 40,
    height: 128,
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginRight: 8,
  },
  yAxisLabel: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  chartMain: {
    flex: 1,
  },
  chartCanvas: {
    width: '100%',
    height: 128,
    position: 'relative',
  },
  gridLineTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  gridLineMid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 64,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  gridLineBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 999,
    transformOrigin: 'left center',
  },
  lineDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  xLabelsRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabelText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '500',
    width: `${100 / TREND_DAYS}%`,
    textAlign: 'center',
  },
  xAxisTitle: {
    marginTop: 2,
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableWrap: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    color: '#334155',
    fontSize: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableHeaderText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOpacity: 0.34,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    alignItems: 'flex-end',
    paddingTop: 58,
    paddingRight: 20,
  },
  menuCard: {
    width: 170,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  modalCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  input: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  editSectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  imageActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  uploadImageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  uploadImageActionText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '700',
  },
  clearImageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearImageActionText: {
    color: '#991b1b',
    fontSize: 11,
    fontWeight: '700',
  },
  uploadPreviewCard: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPreviewHint: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 14,
  },
  avatarChoicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarChoice: {
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  avatarChoiceActive: {
    borderColor: '#16a34a',
    backgroundColor: '#ecfdf5',
  },
  avatarChoiceTile: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChoiceWrap: {
    width: 32,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarHair: {
    position: 'absolute',
    top: 5,
    width: 20,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  avatarHead: {
    position: 'absolute',
    top: 12,
    width: 14,
    height: 16,
    borderRadius: 8,
  },
  avatarBody: {
    position: 'absolute',
    bottom: -5,
    width: 22,
    height: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  mealRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  mealChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    paddingVertical: 9,
  },
  mealChipActive: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  mealChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  mealChipTextActive: {
    color: '#065f46',
  },
  modalActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryAction: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#e2e8f0',
  },
  secondaryActionText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryAction: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#16a34a',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
