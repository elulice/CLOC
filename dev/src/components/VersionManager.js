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
    let errorShown = false;
    const initializeData = async () => {
      try {
        // Cargar preferencia de redirección
        const savedAutoRedirect = localStorage.getItem('versionAutoRedirect');
        if (savedAutoRedirect !== null) {
          setAutoRedirect(savedAutoRedirect === 'true');
        }

        await loadVersions(() => { errorShown = true; });

        // Establecer versión activa
        if (currentVersion) {
          setActiveVersionId(currentVersion.id);
        }

        setIsInitialized(true);
      } catch (error) {
        const msg = (error && error.message) ? error.message : String(error);
        if (
          msg.includes('Corrupt cache') ||
          msg.includes('not found') ||
          msg.includes('cache') ||
          msg.includes('undefined')
        ) {
          // Errores esperados: solo loguear
          console.warn('Non-critical error while loading data:', error);
        } else if (!errorShown) {
          message.error('Error loading data');
        }
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

  const loadVersions = async (onError) => {
    try {
      const data = await versionService.getAllVersions();
      const sortedVersions = data.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      setVersions(sortedVersions);
    } catch (error) {
      if (onError) onError();
      message.error('Error loading versions');
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
          <Text strong>Version Management</Text>
          <Space
            direction="vertical"
            size={0}
            style={{
              alignItems: 'flex-end',
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                width: '100%',
                minWidth: 0,
              }}
            >
              <Switch
                checkedChildren={<HomeOutlined />}
                unCheckedChildren={<HomeOutlined />}
                checked={autoRedirect}
                onChange={handleAutoRedirectChange}
              />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: '1rem',
                  minWidth: 0,
                  wordBreak: 'break-word',
                  flex: 1,
                }}
              >
                <HomeOutlined style={{ marginRight: 8 }} />
                Auto Redirect
              </Text>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 'normal',
                color: '#888',
                marginTop: 2,
                lineHeight: 1.2,
                width: '100%',
                textAlign: 'right',
                wordBreak: 'break-word',
                letterSpacing: -0.3,
              }}
            >
              When switching version
            </div>
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
        Create New Version
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
                    Active
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
                    Activate
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
                  Delete
                </Button>
              </div>
            ]}
          >
            <List.Item.Meta
              title={version.name}
              description={`Version ${version.version}`}
            />
          </List.Item>
        )}
      />

      <Modal
        title="Create New Version"
        open={isModalVisible}
        onOk={createNewVersion}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Version name"
          value={newVersionName}
          onChange={(e) => setNewVersionName(e.target.value)}
        />
      </Modal>

      <Modal
        title="Version Info"
        open={!!selectedVersionInfo}
        onCancel={() => setSelectedVersionInfo(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedVersionInfo(null)}>
            Close
          </Button>
        ]}
      >
        {selectedVersionInfo && (
          <div>
            <h3>{selectedVersionInfo.name}</h3>
            <p>Version: {selectedVersionInfo.version}</p>
            <p>Created: {new Date(selectedVersionInfo.createdAt).toLocaleString()}</p>
            <h4>Changes:</h4>
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