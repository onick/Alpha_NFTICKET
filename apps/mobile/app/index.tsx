import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  likes_count: number;
  comments_count: number;
  created_at: string;
  type: 'text' | 'event' | 'purchase';
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      // Mock data for now - will integrate with API later
      const mockPosts: Post[] = [
        {
          id: '1',
          content: '¡Qué noche tan increíble en el concierto de Romeo Santos! 🎤✨ La energía del público fue impresionante.',
          author: {
            name: 'Ana Herrera',
            username: 'ana_events',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          },
          likes_count: 847,
          comments_count: 156,
          created_at: '2024-01-15T10:30:00Z',
          type: 'text',
        },
        {
          id: '2',
          content: 'Nuevo evento: Tech Summit RD 2024 🚀. No te lo pierdas, será increíble.',
          author: {
            name: 'Carlos Rivera',
            username: 'carlostech',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          },
          likes_count: 234,
          comments_count: 45,
          created_at: '2024-01-14T15:20:00Z',
          type: 'event',
        },
      ];
      setPosts(mockPosts);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el feed');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'hace menos de 1h';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NFTicket</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.feedContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.author.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.postInfo}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                <Text style={styles.username}>@{post.author.username}</Text>
                <Text style={styles.timestamp}>{formatTime(post.created_at)}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>❤️ {post.likes_count}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>💬 {post.comments_count}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>🔗 Compartir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
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
  feedContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  username: {
    fontSize: 14,
    color: '#64748b',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
  },
});