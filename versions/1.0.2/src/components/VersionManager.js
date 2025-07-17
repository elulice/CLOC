import React, { useState, useEffect } from 'react';
import { Button, Card, List, Modal, Input, message, Tag, Switch, Space, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, SaveOutlined, CheckCircleOutlined, ReloadOutlined, ExclamationCircleOutlined, HomeOutlined } from '@ant-design/icons';
import useCurrentVersion from '../hooks/useCurrentVersion';

const { Text } = Typography;
const { confirm } = Modal;

const VersionManager = () => {
  const [versions, setVersions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [autoRedirect, setAutoRedirect] = useState(() => {
    const savedPreference = localStorage.getItem('versionManagerAutoRedirect');
    return savedPreference !== null ? JSON.parse(savedPreference) : true;
  });
  const { currentVersion, refetchCurrentVersion } = useCurrentVersion();

  useEffect(() => {
    // Cargar versiones existentes
    loadVersions();
  }, []);

  const handleAutoRedirectChange = (checked) => {
    setAutoRedirect(checked);
    localStorage.setItem('versionManagerAutoRedirect', JSON.stringify(checked));
  };

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
      console.log('Iniciando cambio de versión a:', versionId);
      const response = await fetch(`/api/versions/${versionId}/switch`, {
        method: 'POST',
      });
      
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (data.success) {
        console.log('Cambio de versión exitoso');
        message.success('Versión activada exitosamente');
        
        // Actualizar la versión actual y la lista de versiones
        console.log('Actualizando estados...');
        await loadVersions();
        if (typeof refetchCurrentVersion === 'function') {
          await refetchCurrentVersion();
        }
        console.log('Estados actualizados');
        
        // Recargar la página después de un breve retraso
        setTimeout(() => {
          if (autoRedirect) {
            window.location.href = '/';
          } else {
            window.location.reload();
          }
        }, 1000);
      } else {
        console.log('Error en la respuesta:', data.error);
        message.error(data.error || 'Error al cambiar de versión');
      }
    } catch (error) {
      console.error('Error al cambiar de versión:', error);
      message.error('Error al cambiar de versión. Por favor, intenta nuevamente.');
    }
  };

  const showDeleteConfirm = (versionId, versionName) => {
    confirm({
      title: '¿Estás seguro de que deseas eliminar esta versión?',
      icon: <ExclamationCircleOutlined />,
      content: `La versión "${versionName}" será eliminada permanentemente. Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteVersion(versionId),
    });
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
    <Card 
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>Gestor de Versiones</span>
          <Space>
            <Text>
              <HomeOutlined style={{ marginRight: 8 }} />
              Redirección automática
            </Text>
            <Switch
              checked={autoRedirect}
              onChange={handleAutoRedirectChange}
              checkedChildren={<ReloadOutlined />}
              unCheckedChildren="No"
            />
          </Space>
        </Space>
      } 
      className="version-manager"
    >
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
              currentVersion?.id === version.id ? (
                <Button 
                  style={{ 
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    color: 'white',
                    cursor: 'default',
                    minWidth: '80px'
                  }}
                  icon={<CheckCircleOutlined />}
                >
                  Versión Activa
                </Button>
              ) : (
                <Button 
                  icon={<CopyOutlined />}
                  onClick={() => switchVersion(version.id)}
                >
                  Activar
                </Button>
              ),
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(version.id, version.name)}
                disabled={currentVersion?.id === version.id}
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