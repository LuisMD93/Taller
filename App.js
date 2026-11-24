import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import TodoItem from './src/components/TodoItem';
import { obtenerTareasConFetch, obtenerTareasConAxios } from './src/services/TodoService';

const FILTERS = [
  { key: 'ALL', label: 'Todas' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'COMPLETED', label: 'Completadas' },
];

export default function App() {
  const [engine, setEngine] = useState('AXIOS'); // 'AXIOS' | 'FETCH'
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadTasks = useCallback(
    async ({ simulateError = false, isRefresh = false } = {}) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMessage(null);

      try {
        const data =
          engine === 'FETCH'
            ? await obtenerTareasConFetch(simulateError)
            : await obtenerTareasConAxios(simulateError);
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        setTasks([]);
        setErrorMessage(err?.message || 'Error inesperado al sincronizar las tareas.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [engine]
  );

  // Descarga inicial al montar y cada vez que cambia el motor HTTP activo
  useEffect(() => {
    loadTasks({ simulateError: false, isRefresh: false });
  }, [loadTasks]);

  // Filtrado en memoria sobre el arreglo ya descargado
  const visibleTasks = useMemo(() => {
    if (filter === 'COMPLETED') {
      return tasks.filter((item) => item.completed === true);
    }
    if (filter === 'PENDING') {
      return tasks.filter((item) => item.completed === false);
    }
    return tasks;
  }, [tasks, filter]);

  const renderItem = useCallback(({ item }) => <TodoItem item={item} />, []);
  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Encabezado, Simulación de Fallo y Selector de Motor HTTP */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.brand}>ANDINAOPS S.A.S.</Text>
            <Text style={styles.headerTitle}>TaskAudit Mobile</Text>
          </View>
          <TouchableOpacity
            style={styles.simErrorBtn}
            onPress={() => loadTasks({ simulateError: true, isRefresh: false })}
          >
            <Text style={styles.simErrorText}>Simular Fallo 404</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.engineRow}>
          <Text style={styles.engineLabel}>Motor HTTP:</Text>
          {['AXIOS', 'FETCH'].map((mode) => {
            const active = engine === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.engineBtn, active && styles.engineBtnActive]}
                onPress={() => setEngine(mode)}
              >
                <Text style={[styles.engineBtnText, active && styles.engineBtnTextActive]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Filtros Locales y Contador Dinámico */}
      <View style={styles.filterSection}>
        <View style={styles.filterTabs}>
          {FILTERS.map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
                onPress={() => setFilter(tab.key)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!loading && !errorMessage && (
          <Text style={styles.counterText}>
            Tareas visibles: {visibleTasks.length} ({engine})
          </Text>
        )}
      </View>

      {/* Estado de Carga, Error o Lista Virtualizada */}
      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Sincronizando tareas de auditoría...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centeredState}>
          <View style={styles.errorCard}>
            <Text style={styles.errorHeading}>Error de Sincronización</Text>
            <Text style={styles.errorDetail}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadTasks({ simulateError: false, isRefresh: false })}
            >
              <Text style={styles.retryBtnText}>Reintentar Sincronización</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={visibleTasks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTasks({ simulateError: false, isRefresh: true })}
              colors={['#0284C7']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No hay tareas disponibles para este filtro.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brand: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  simErrorBtn: {
    backgroundColor: '#B91C1C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  simErrorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engineLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  engineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  engineBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  engineBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  engineBtnTextActive: {
    color: '#FFFFFF',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#0F172A',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  counterText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  errorHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 18,
  },
  retryBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: 14,
    paddingBottom: 24,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});