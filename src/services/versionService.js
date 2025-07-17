const API_URL = '/api/versions';

export const versionService = {
  async getAllVersions() {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error al cargar las versiones');
    }
    return response.json();
  },

  async switchVersion(versionId) {
    const response = await fetch(`${API_URL}/${versionId}/switch`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Error al cambiar de versión');
    }
    return response.json();
  },

  async deleteVersion(versionId) {
    const response = await fetch(`${API_URL}/${versionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la versión');
    }
    return response.json();
  }
}; 