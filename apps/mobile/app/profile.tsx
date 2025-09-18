import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  stats: {
    totalTickets: number;
    activeTickets: number;
    eventsAttended: number;
    totalSpent: number;
  };
  preferences: {
    shareTicketPurchases: boolean;
    publicProfile: boolean;
    emailNotifications: boolean;
  };
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'settings'>('overview');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Mock data for now - will integrate with API later
      const mockProfile: UserProfile = {
        id: 'user123',
        name: 'Ana Herrera',
        username: 'ana_events',
        email: 'ana@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Amante de la música dominicana y los eventos culturales. Siempre buscando las mejores experiencias.',
        location: 'Santo Domingo, RD',
        website: 'https://anaevents.com',
        joinDate: '2023-06-15T00:00:00Z',
        stats: {
          totalTickets: 12,
          activeTickets: 3,
          eventsAttended: 8,
          totalSpent: 2450,
        },
        preferences: {
          shareTicketPurchases: true,
          publicProfile: true,
          emailNotifications: true,
        },
      };
      setProfile(mockProfile);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidad próximamente disponible');
  };

  const handlePreferenceChange = (key: keyof UserProfile['preferences']) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: !profile.preferences[key],
      },
    };

    setProfile(updatedProfile);
    // Here you would save to API/local storage
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: () => {
          // Handle logout
          Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
        }},
      ]
    );
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
          <View style={styles.locationContainer}>
            {profile.location && (
              <Text style={styles.location}>📍 {profile.location}</Text>
            )}
            {profile.website && (
              <Text style={styles.website}>🔗 {profile.website.replace(/^https?:\/\//, '')}</Text>
            )}
          </View>
          <Text style={styles.joinDate}>
            Miembro desde {formatJoinDate(profile.joinDate)}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.stats.totalTickets}</Text>
          <Text style={styles.statLabel}>Tickets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.stats.eventsAttended}</Text>
          <Text style={styles.statLabel}>Eventos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>RD${profile.stats.totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Gastado</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Resumen' },
          { key: 'tickets', label: 'Tickets' },
          { key: 'settings', label: 'Configuración' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>🎫</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Compraste ticket para Concierto de Bachata</Text>
                <Text style={styles.activityTime}>Hace 2 horas</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>❤️</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Te gustó el evento Tech Summit RD 2024</Text>
                <Text style={styles.activityTime}>Hace 1 día</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📅</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Asististe al Festival de Jazz</Text>
                <Text style={styles.activityTime}>Hace 3 días</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'tickets' && (
          <View style={styles.ticketsContainer}>
            <Text style={styles.sectionTitle}>Mis Tickets NFT</Text>
            <View style={styles.ticketSummary}>
              <View style={styles.ticketStat}>
                <Text style={styles.ticketStatNumber}>{profile.stats.activeTickets}</Text>
                <Text style={styles.ticketStatLabel}>Activos</Text>
              </View>
              <View style={styles.ticketStat}>
                <Text style={styles.ticketStatNumber}>{profile.stats.totalTickets - profile.stats.activeTickets}</Text>
                <Text style={styles.ticketStatLabel}>Usados</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>Ver Todos los Tickets</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Preferencias</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Compartir compras en el feed</Text>
                <Text style={styles.settingDescription}>
                  Permite que otros vean tus compras de tickets
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  profile.preferences.shareTicketPurchases && styles.toggleButtonActive,
                ]}
                onPress={() => handlePreferenceChange('shareTicketPurchases')}
              >
                <View
                  style={[
                    styles.toggleIndicator,
                    profile.preferences.shareTicketPurchases && styles.toggleIndicatorActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Perfil público</Text>
                <Text style={styles.settingDescription}>
                  Permite que otros usuarios vean tu perfil
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  profile.preferences.publicProfile && styles.toggleButtonActive,
                ]}
                onPress={() => handlePreferenceChange('publicProfile')}
              >
                <View
                  style={[
                    styles.toggleIndicator,
                    profile.preferences.publicProfile && styles.toggleIndicatorActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificaciones por email</Text>
                <Text style={styles.settingDescription}>
                  Recibe actualizaciones sobre eventos y tickets
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  profile.preferences.emailNotifications && styles.toggleButtonActive,
                ]}
                onPress={() => handlePreferenceChange('emailNotifications')}
              >
                <View
                  style={[
                    styles.toggleIndicator,
                    profile.preferences.emailNotifications && styles.toggleIndicatorActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  username: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  locationContainer: {
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  website: {
    fontSize: 14,
    color: '#3b82f6',
  },
  joinDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingVertical: 15,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3b82f6',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  overviewContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  ticketsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
  },
  ticketSummary: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  ticketStat: {
    flex: 1,
    alignItems: 'center',
  },
  ticketStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ticketStatLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  viewAllButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#3b82f6',
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  toggleIndicatorActive: {
    transform: [{ translateX: 22 }],
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});