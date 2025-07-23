import React, { useState, useEffect } from 'react';
import { Button, Card, List, Modal, Input, message } from 'antd';
import { CopyOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

const VersionManager = () => {
  const [versions, setVersions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    // Cargar versiones existentes
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const response = await fetch('/api/versions');
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      message.error('Error al cargar las versiones');
    }
  };

  const createNewVersion = async () => {
    try {
      const response = await fetch('/api/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newVersionName }),
      });
      
      if (response.ok) {
        message.success('Versión creada exitosamente');
        setIsModalVisible(false);
        setNewVersionName('');
        loadVersions();
      }
    } catch (error) {
      message.error('Error al crear la versión');
    }
  };

  const switchVersion = async (versionId) => {
    try {
      const response = await fetch(`/api/versions/${versionId}/switch`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        message.success(data.message || 'Versión activada exitosamente');
        setSelectedVersion(versionId);
        
        // Recargar la página después de un breve retraso
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      message.error('Error al cambiar de versión');
    }
  };

  const deleteVersion = async (versionId) => {
    try {
      const response = await fetch(`/api/versions/${versionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        message.success('Versión eliminada exitosamente');
        loadVersions();
      }
    } catch (error) {
      message.error('Error al eliminar la versión');
    }
  };

  return (
    <Card title="Gestor de Versiones" className="version-manager">
      <Button 
        type="primary" 
        icon={<SaveOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Crear Nueva Versión
      </Button>

      <List
        dataSource={versions}
        renderItem={(version) => (
          <List.Item
            actions={[
              <Button 
                icon={<CopyOutlined />}
                onClick={() => switchVersion(version.id)}
                disabled={selectedVersion === version.id}
              >
                Activar
              </Button>,
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => deleteVersion(version.id)}
              >
                Eliminar
              </Button>
            ]}
          >
            <List.Item.Meta
              title={version.name}
              description={`Creada el ${new Date(version.createdAt).toLocaleDateString()}`}
            />
          </List.Item>
        )}
      />

      <Modal
        title="Crear Nueva Versión"
        open={isModalVisible}
        onOk={createNewVersion}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Nombre de la versión"
          value={newVersionName}
          onChange={(e) => setNewVersionName(e.target.value)}
        />
      </Modal>
    </Card>
  );
};

export default VersionManager; 