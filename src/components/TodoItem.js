import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const capitalizeSentence = (text = '') => {
  const clean = text.trim();
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const TodoItem = React.memo(({ item }) => {
  const isCompleted = Boolean(item.completed);

  return (
    <View style={[styles.card, isCompleted ? styles.cardCompleted : styles.cardPending]}>
      <View style={styles.headerRow}>
        <Text style={styles.taskId}>Tarea #{item.id}</Text>
        <Text style={styles.userId}>Responsable: {item.userId}</Text>
        <View style={[styles.badge, isCompleted ? styles.badgeCompleted : styles.badgePending]}>
          <Text style={[styles.badgeText, isCompleted ? styles.textCompleted : styles.textPending]}>
            {isCompleted ? 'COMPLETADA' : 'PENDIENTE'}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>{capitalizeSentence(item.title)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardCompleted: {
    borderLeftColor: '#16A34A',
  },
  cardPending: {
    borderLeftColor: '#EA580C',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  taskId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  userId: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeCompleted: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FFEDD5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  textCompleted: {
    color: '#15803D',
  },
  textPending: {
    color: '#C2410C',
  },
  title: {
    fontSize: 15,
    lineHeight: 21,
    color: '#1E293B',
  },
});

export default TodoItem;