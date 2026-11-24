import axios from 'axios';

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const TIMEOUT_MS = 6000;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Obtiene tareas mediante Fetch API, validando response.ok y controlando timeout de 6000 ms.
 */
export const obtenerTareasConFetch = async (simularError = false) => {
  const endpoint = simularError ? '/todos-error' : '/todos';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: No se pudo consultar ${endpoint}.`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Error de red/timeout (Fetch): Tiempo límite de ${TIMEOUT_MS} ms excedido.`);
    }
    if (error.message && error.message.startsWith('Error HTTP ')) {
      throw error;
    }
    throw new Error(`Error de red (Fetch): ${error.message || 'Sin conexión a internet.'}`);
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Obtiene tareas mediante instancia Axios con timeout de 6000 ms,
 * diferenciando errores de servidor (error.response) de errores de red/timeout (error.request).
 */
export const obtenerTareasConAxios = async (simularError = false) => {
  const endpoint = simularError ? '/todos-error' : '/todos';

  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Error de servidor (Axios HTTP ${error.response.status}): ${error.response.statusText || 'Respuesta inválida'}.`
      );
    }
    if (error.request) {
      const detalle =
        error.code === 'ECONNABORTED'
          ? `Tiempo límite de ${TIMEOUT_MS} ms agotado`
          : 'Sin respuesta del servidor o red no disponible';
      throw new Error(`Error de red/timeout (Axios): ${detalle}.`);
    }
    throw new Error(`Error de solicitud (Axios): ${error.message}`);
  }
};