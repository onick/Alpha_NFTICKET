import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  location: string;
  event_date: string;
  category: string;
  image_url: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Música', 'Tecnología', 'Deportes', 'Arte', 'Teatro'];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Mock data for now - will integrate with API later
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Concierto de Bachata',
          description: 'Una noche inolvidable con los mejores artistas de bachata dominicana',
          venue: 'Teatro Nacional',
          location: 'Santo Domingo',
          event_date: '2024-12-20T20:00:00Z',
          category: 'Música',
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop',
          price_range: {
            min: 150,
            max: 500,
            currency: 'DOP',
          },
        },
        {
          id: '2',
          title: 'Tech Summit RD 2024',
          description: 'El evento más importante de tecnología en República Dominicana',
          venue: 'Centro de Convenciones',
          location: 'Santiago',
          event_date: '2024-11-15T09:00:00Z',
          category: 'Tecnología',
          image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
          price_range: {
            min: 75,
            max: 200,
            currency: 'DOP',
          },
        },
        {
          id: '3',
          title: 'Festival de Jazz',
          description: 'Jazz internacional en el Malecón de Santo Domingo',
          venue: 'Malecón Centro',
          location: 'Santo Domingo',
          event_date: '2025-01-10T19:00:00Z',
          category: 'Música',
          image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=250&fit=crop',
          price_range: {
            min: 125,
            max: 350,
            currency: 'DOP',
          },
        },
      ];
      setEvents(mockEvents);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEvents = selectedCategory === 'Todos'
    ? events
    : events.filter(event => event.category === selectedCategory);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eventos</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView style={styles.eventsContainer}>
        {filteredEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventCard}>
            <Image source={{ uri: event.image_url }} style={styles.eventImage} />
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{event.category}</Text>
                </View>
              </View>

              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>

              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <Text style={styles.detailText}>
                    {formatDate(event.event_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🕐</Text>
                  <Text style={styles.detailText}>
                    {formatTime(event.event_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>
                    {event.venue}, {event.location}
                  </Text>
                </View>
              </View>

              <View style={styles.eventFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    RD${event.price_range.min} - RD${event.price_range.max}
                  </Text>
                </View>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Comprar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay eventos en esta categoría</Text>
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
  categoryContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  buyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
});