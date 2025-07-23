import React, { useState, useEffect } from 'react';
import { Button, Card, List, Modal, Input, message, Tag, Switch, Space, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, SaveOutlined, CheckCircleOutlined, ReloadOutlined, ExclamationCircleOutlined, HomeOutlined, InfoCircleOutlined, CheckOutlined, SwapOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCurrentVersion from '../hooks/useCurrentVersion';
import { versionService } from '../services/versionService';

const { Text } = Typography;
const { confirm } = Modal;

const VersionManager = ({ lang, texts }) => {
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
        message.success(texts.versionManager.successCreate);
        setIsModalVisible(false);
        setNewVersionName('');
        loadVersions();
      }
    } catch (error) {
      message.error('Error creating version');
    }
  };

  const showDeleteConfirm = (version) => {
    confirm({
      title: texts.versionManager.deleteConfirmTitle,
      icon: <ExclamationCircleOutlined />,
      content: texts.versionManager.deleteConfirmContent,
      okText: texts.versionManager.deleteConfirmYes,
      okType: 'danger',
      cancelText: texts.versionManager.deleteConfirmCancel,
      onOk: () => handleDeleteVersion(version.id)
    });
  };

  const showVersionInfo = (version) => {
    setSelectedVersionInfo(version);
  };

  const handleDeleteVersion = async (versionId) => {
    try {
      await versionService.deleteVersion(versionId);
      message.success('Version deleted successfully');
      loadVersions();
    } catch (error) {
      message.error('Error deleting version');
    }
  };

  const switchVersion = async (versionId) => {
    try {
      await versionService.switchVersion(versionId);
      message.success('Version activated successfully');
      setActiveVersionId(versionId);
      
      setTimeout(() => {
        if (autoRedirect) {
          navigate('/');
        } else {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      message.error('Error switching version');
    }
  };

  const renderChanges = (changes) => {
    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return <li className="text-gray-400 italic">{texts.versionManager.noChangesRegistered}</li>;
    }
    return (
      <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        {changes.map((change, index) => (
          <li
            key={index}
            className="bg-gray-50 rounded-lg shadow-sm px-3 py-2 text-gray-700 text-sm border border-gray-200"
          >
            {change}
          </li>
        ))}
      </ul>
    );
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
          <Text strong>{texts.versionManager.title}</Text>
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
                {texts.versionManager.autoRedirect}
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
              {texts.versionManager.switchVersion}
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
        {texts.versionManager.createNew}
      </Button>

      <List
        grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        dataSource={versions}
        renderItem={version => (
          <List.Item>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between transition-transform hover:scale-[1.02] hover:shadow-2xl duration-200">
              <List.Item.Meta
                title={version.name}
                description={`${texts.versionManager.version}: ${version.version}`}
              />
              <div className="flex flex-col md:flex-row md:justify-end items-center mt-4 gap-2 md:gap-4 w-full">
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    icon={<InfoCircleOutlined />}
                    onClick={() => showVersionInfo(version)}
                  />
                </div>
                <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                  {activeVersionId === version.id ? (
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                        color: 'white',
                        cursor: 'default',
                        width: '100px',
                      }}
                      icon={<CheckCircleOutlined />}
                    >
                      {texts.versionManager.active}
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => switchVersion(version.id)}
                      style={{ 
                        width: '100%',
                        backgroundColor: 'transparent',
                        borderColor: '#52c41a',
                        color: '#52c41a',
                        width: '100px',
                      }}
                      icon={<CheckCircleOutlined />}
                    >
                      {texts.versionManager.activate}
                    </Button>
                  )}
                </div>
                <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => showDeleteConfirm(version)}
                    disabled={activeVersionId === version.id}
                    style={{ width: '100%' }}
                  >
                    {texts.versionManager.delete}
                  </Button>
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />

      <Modal
        title={texts.versionManager.createNewModalTitle}
        open={isModalVisible}
        onOk={createNewVersion}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder={texts.versionManager.versionNamePlaceholder}
          value={newVersionName}
          onChange={(e) => setNewVersionName(e.target.value)}
        />
      </Modal>

      <Modal
        title={texts.versionManager.versionInfoTitle}
        open={!!selectedVersionInfo}
        onCancel={() => setSelectedVersionInfo(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedVersionInfo(null)}>
            {texts.versionManager.close}
          </Button>
        ]}
      >
        {selectedVersionInfo && (
          <div>
            <h3>{selectedVersionInfo.name}</h3>
            <p>{texts.versionManager.version}: {selectedVersionInfo.version}</p>
            <p>{texts.versionManager.created}: {new Date(selectedVersionInfo.createdAt).toLocaleString()}</p>
            <h4>{texts.versionManager.changes}:</h4>
            {renderChanges(selectedVersionInfo.changes)}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default VersionManager; 