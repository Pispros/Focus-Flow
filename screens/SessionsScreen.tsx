import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  XCircle,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import {
  deleteSession,
  formatDuration,
  formatTime,
  getAllSessionsGroupedByDate,
} from '../services/app.service';

type FilterType = 'all' | 'completed' | 'cancelled';

interface Session {
  id: number;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  created_at: string;
}

interface GroupedSession {
  date: string;
  displayDate: string;
  totalMinutes: number;
  sessions: Session[];
}

export default function SessionsHistoryScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<GroupedSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<GroupedSession[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadSessions = useCallback(async () => {
    try {
      const data = await getAllSessionsGroupedByDate();
      setSessions(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const applyFilter = (data: GroupedSession[], filterType: FilterType) => {
    if (filterType === 'all') {
      setFilteredSessions(data);
      return;
    }

    const filtered = data
      .map(group => ({
        ...group,
        sessions: group.sessions.filter(s =>
          filterType === 'completed' ? s.completed : !s.completed,
        ),
      }))
      .filter(group => group.sessions.length > 0);

    setFilteredSessions(filtered);
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilter(sessions, filter);
  }, [filter, sessions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleDeleteSession = async (sessionId: number) => {
    await deleteSession(sessionId);
    await loadSessions();
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const renderSessionItem = ({ item: session }: { item: Session }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionLeft}>
        <View
          style={[
            styles.statusIcon,
            {
              backgroundColor: session.completed
                ? `${Colors.dark.green}20`
                : `${Colors.dark.red}20`,
            },
          ]}
        >
          {session.completed ? (
            <CheckCircle size={16} stroke={Colors.dark.green} />
          ) : (
            <XCircle size={16} stroke={Colors.dark.red} />
          )}
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDuration}>
            {formatDuration(session.duration_minutes)}
          </Text>
          <Text style={styles.sessionTime}>
            {formatTime(session.started_at)}
            {session.ended_at && ` - ${formatTime(session.ended_at)}`}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDeleteSession(session.id)}
      >
        <Trash2 size={18} stroke={Colors.dark.zinc500} />
      </TouchableOpacity>
    </View>
  );

  const renderDateGroup = ({ item: group }: { item: GroupedSession }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <View style={styles.dateLeft}>
          <Calendar size={16} stroke={Colors.dark.zinc400} />
          <Text style={styles.dateText}>{group.displayDate}</Text>
        </View>
        <View style={styles.dateSummary}>
          <Clock size={14} stroke={Colors.dark.primary} />
          <Text style={styles.dateTotalTime}>
            {formatDuration(group.totalMinutes)}
          </Text>
        </View>
      </View>
      {group.sessions.map(session => (
        <View key={session.id}>{renderSessionItem({ item: session })}</View>
      ))}
    </View>
  );

  const totalSessions = filteredSessions.reduce(
    (acc, group) => acc + group.sessions.length,
    0,
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} stroke={Colors.dark.zinc50} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session History</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'completed', 'cancelled'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === f && styles.filterBtnTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {totalSessions} session{totalSessions !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Clock size={48} stroke={Colors.dark.zinc500} />
          <Text style={styles.emptyTitle}>No sessions found</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'Start your first focus session!'
              : `No ${filter} sessions yet.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={item => item.date}
          renderItem={renderDateGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.dark.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.zinc50,
    marginLeft: '20%',
  },
  headerRight: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.dark.primaryMuted,
    borderColor: Colors.dark.primary,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.zinc400,
  },
  filterBtnTextActive: {
    color: Colors.dark.primary,
  },
  summaryBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.dark.zinc500,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.zinc50,
  },
  dateSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateTotalTime: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    gap: 2,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.zinc50,
  },
  sessionTime: {
    fontSize: 12,
    color: Colors.dark.zinc400,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.zinc50,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.zinc500,
    textAlign: 'center',
  },
});
