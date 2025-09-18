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

interface Ticket {
  id: string;
  eventName: string;
  eventDate: string;
  ticketType: string;
  price: number;
  status: 'active' | 'used' | 'cancelled';
  qrCode: string;
  venue: string;
  seatInfo?: string;
}

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'used' | 'all'>('active');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      // Mock data for now - will integrate with API later
      const mockTickets: Ticket[] = [
        {
          id: '1',
          eventName: 'Concierto de Bachata',
          eventDate: '2024-12-20',
          ticketType: 'VIP',
          price: 150,
          status: 'active',
          qrCode: 'NFT123456',
          venue: 'Teatro Nacional',
          seatInfo: 'Sección A, Fila 5, Asiento 12',
        },
        {
          id: '2',
          eventName: 'Tech Summit RD 2024',
          eventDate: '2024-11-15',
          ticketType: 'General',
          price: 75,
          status: 'used',
          qrCode: 'NFT789012',
          venue: 'Centro de Convenciones',
        },
        {
          id: '3',
          eventName: 'Festival de Jazz',
          eventDate: '2025-01-10',
          ticketType: 'Premium',
          price: 125,
          status: 'active',
          qrCode: 'NFT345678',
          venue: 'Malecón Centro',
          seatInfo: 'Área General',
        },
      ];
      setTickets(mockTickets);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#059669';
      case 'used':
        return '#6b7280';
      case 'cancelled':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'used':
        return 'Usado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    return ticket.status === activeTab;
  });

  const handleShowQR = (ticket: Ticket) => {
    Alert.alert(
      'Código QR',
      `Ticket: ${ticket.qrCode}\n\nEvento: ${ticket.eventName}`,
      [
        { text: 'Cerrar' },
        { text: 'Compartir', onPress: () => shareTicket(ticket) },
      ]
    );
  };

  const shareTicket = (ticket: Ticket) => {
    Alert.alert('Compartir', 'Funcionalidad de compartir próximamente disponible');
  };

  const downloadTicket = (ticket: Ticket) => {
    Alert.alert('Descargar', 'Funcionalidad de descarga próximamente disponible');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Tickets NFT</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'active', label: 'Activos' },
          { key: 'used', label: 'Usados' },
          { key: 'all', label: 'Todos' },
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

      {/* Tickets List */}
      <ScrollView style={styles.ticketsContainer}>
        {filteredTickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketMainInfo}>
                <Text style={styles.eventName}>{ticket.eventName}</Text>
                <View style={styles.ticketMeta}>
                  <Text style={styles.ticketType}>{ticket.ticketType}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(ticket.status)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>RD${ticket.price.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.ticketDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detailText}>
                  {formatEventDate(ticket.eventDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={styles.detailText}>
                  {ticket.venue}
                </Text>
              </View>
              {ticket.seatInfo && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>💺</Text>
                  <Text style={styles.detailText}>
                    {ticket.seatInfo}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.ticketFooter}>
              <View style={styles.qrContainer}>
                <Text style={styles.qrLabel}>Código:</Text>
                <Text style={styles.qrCode}>{ticket.qrCode}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShowQR(ticket)}
                >
                  <Text style={styles.actionButtonText}>Ver QR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => downloadTicket(ticket)}
                >
                  <Text style={styles.actionButtonText}>Descargar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {filteredTickets.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎫</Text>
            <Text style={styles.emptyTitle}>No hay tickets</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active'
                ? 'No tienes tickets activos'
                : activeTab === 'used'
                ? 'No tienes tickets usados'
                : 'No tienes tickets aún'}
            </Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
  ticketsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketMainInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketType: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  ticketDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  qrContainer: {
    flex: 1,
  },
  qrLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  qrCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});