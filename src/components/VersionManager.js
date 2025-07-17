import React, { useState, useEffect } from 'react';
import { Button, Card, List, Modal, Input, message, Tag, Switch, Space, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, SaveOutlined, CheckCircleOutlined, ReloadOutlined, ExclamationCircleOutlined, HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCurrentVersion from '../hooks/useCurrentVersion';
import { versionService } from '../services/versionService';

const { Text } = Typography;
const { confirm } = Modal;

const VersionManager = () => {
  const [versions, setVersions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [selectedVersionInfo, setSelectedVersionInfo] = useState(null);
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { currentVersion } = useCurrentVersion();

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Cargar preferencia de redirección
        const savedAutoRedirect = localStorage.getItem('versionAutoRedirect');
        if (savedAutoRedirect !== null) {
          setAutoRedirect(savedAutoRedirect === 'true');
        }

        // Cargar versiones
        const data = await versionService.getAllVersions();
        const sortedVersions = data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setVersions(sortedVersions);

        // Establecer versión activa
        if (currentVersion) {
          setActiveVersionId(currentVersion.id);
        }

        setIsInitialized(true);
      } catch (error) {
        message.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentVersion]);

  const handleAutoRedirectChange = (checked) => {
    setAutoRedirect(checked);
    localStorage.setItem('versionAutoRedirect', checked);
  };

  const loadVersions = async () => {
    try {
      const data = await versionService.getAllVersions();
      const sortedVersions = data.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      setVersions(sortedVersions);
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

  const showDeleteConfirm = (version) => {
    confirm({
      title: '¿Estás seguro de eliminar esta versión?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer y eliminará permanentemente la versión.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => handleDeleteVersion(version.id)
    });
  };

  const showVersionInfo = (version) => {
    setSelectedVersionInfo(version);
  };

  const handleDeleteVersion = async (versionId) => {
    try {
      await versionService.deleteVersion(versionId);
      message.success('Versión eliminada correctamente');
      loadVersions();
    } catch (error) {
      message.error('Error al eliminar la versión');
    }
  };

  const switchVersion = async (versionId) => {
    try {
      await versionService.switchVersion(versionId);
      message.success('Versión activada correctamente');
      setActiveVersionId(versionId);
      
      setTimeout(() => {
        if (autoRedirect) {
          navigate('/');
        } else {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      message.error('Error al cambiar de versión');
    }
  };

  const renderChanges = (changes) => {
    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return <li>No hay cambios registrados para esta versión</li>;
    }
    return changes.map((change, index) => (
      <li key={index}>{change}</li>
    ));
  };

  if (!isInitialized) {
    return (
      <Card loading={true}>
        <div style={{ height: '200px' }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text strong>Gestión de Versiones</Text>
          <Space>
            <Switch
              checkedChildren={<HomeOutlined />}
              unCheckedChildren={<HomeOutlined />}
              checked={autoRedirect}
              onChange={handleAutoRedirectChange}
            />
            <Text>
              <HomeOutlined style={{ marginRight: 8 }} />
              Redirección automática
            </Text>
          </Space>
        </div>
      }
      loading={loading}
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
        renderItem={version => (
          <List.Item
            actions={[
              <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="primary"
                  icon={<InfoCircleOutlined />}
                  onClick={() => showVersionInfo(version)}
                />
              </div>,
              <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                {activeVersionId === version.id ? (
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a',
                      color: 'white',
                      cursor: 'default',
                      width: '100%'
                    }}
                    icon={<CheckCircleOutlined />}
                  >
                    Activa
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => switchVersion(version.id)}
                    style={{ 
                      width: '100%',
                      backgroundColor: 'transparent',
                      borderColor: '#52c41a',
                      color: '#52c41a'
                    }}
                  >
                    Activar
                  </Button>
                )}
              </div>,
              <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                <Button
                  danger
                  onClick={() => showDeleteConfirm(version)}
                  disabled={activeVersionId === version.id}
                  style={{ width: '100%' }}
                >
                  Eliminar
                </Button>
              </div>
            ]}
          >
            <List.Item.Meta
              title={version.name}
              description={`Versión ${version.version}`}
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

      <Modal
        title="Información de la Versión"
        open={!!selectedVersionInfo}
        onCancel={() => setSelectedVersionInfo(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedVersionInfo(null)}>
            Cerrar
          </Button>
        ]}
      >
        {selectedVersionInfo && (
          <div>
            <h3>{selectedVersionInfo.name}</h3>
            <p>Versión: {selectedVersionInfo.version}</p>
            <p>Creada: {new Date(selectedVersionInfo.createdAt).toLocaleString()}</p>
            <h4>Cambios:</h4>
            <ul>
              {renderChanges(selectedVersionInfo.changes)}
            </ul>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default VersionManager; 