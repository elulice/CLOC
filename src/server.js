const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  getCurrentVersion,
  setCurrentVersion,
  createVersion,
  listVersions,
  deleteVersion,
  VERSIONS_DIR
} = require('./config/versionConfig');

const app = express();
app.use(express.json());

// Middleware para servir archivos estáticos de la versión actual
app.use((req, res, next) => {
  const currentVersion = getCurrentVersion();
  if (currentVersion) {
    const versionDir = path.join(VERSIONS_DIR, currentVersion.versionId);
    const publicDir = path.join(versionDir, 'public');
    
    if (fs.existsSync(publicDir)) {
      express.static(publicDir)(req, res, next);
      return;
    }
  }
  next();
});

// API Routes
app.get('/api/versions/current', (req, res) => {
  try {
    const currentVersion = getCurrentVersion();
    if (!currentVersion) {
      return res.status(404).json({ error: 'No hay versión actual establecida' });
    }
    
    const versionDir = path.join(VERSIONS_DIR, currentVersion.versionId);
    const versionFile = path.join(versionDir, 'version.json');
    
    if (fs.existsSync(versionFile)) {
      const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
      res.json(versionData);
    } else {
      res.status(404).json({ error: 'No se encontró la información de la versión actual' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la versión actual' });
  }
});

app.get('/api/versions', (req, res) => {
  try {
    const versions = listVersions();
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar versiones' });
  }
});

app.post('/api/versions', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la versión es requerido' });
    }
    
    const version = await createVersion(name);
    res.json(version);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la versión' });
  }
});

app.post('/api/versions/:versionId/switch', (req, res) => {
  try {
    const { versionId } = req.params;
    console.log('Intentando cambiar a la versión:', versionId);
    
    const versionDir = path.join(VERSIONS_DIR, versionId);
    
    if (!fs.existsSync(versionDir)) {
      console.log('La versión no existe:', versionId);
      return res.status(404).json({ 
        error: 'La versión solicitada no existe',
        success: false 
      });
    }

    const currentVersion = getCurrentVersion();
    if (currentVersion && currentVersion.versionId === versionId) {
      console.log('La versión ya está activa:', versionId);
      return res.json({ 
        success: true, 
        message: 'La versión ya está activa',
        versionId 
      });
    }

    if (setCurrentVersion(versionId)) {
      console.log('Versión activada exitosamente:', versionId);
      res.json({ 
        success: true, 
        message: 'Versión activada exitosamente',
        versionId 
      });
    } else {
      console.log('Error al establecer la versión:', versionId);
      res.status(500).json({ 
        error: 'Error al cambiar de versión',
        success: false 
      });
    }
  } catch (error) {
    console.error('Error en switch version:', error);
    res.status(500).json({ 
      error: 'Error interno al cambiar de versión',
      success: false 
    });
  }
});

app.delete('/api/versions/:versionId', (req, res) => {
  try {
    const { versionId } = req.params;
    if (deleteVersion(versionId)) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Error al eliminar la versión' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la versión' });
  }
});

// Ruta para servir la aplicación React de la versión actual
app.get('*', (req, res) => {
  const currentVersion = getCurrentVersion();
  if (currentVersion) {
    const versionDir = path.join(VERSIONS_DIR, currentVersion.versionId);
    const indexPath = path.join(versionDir, 'public', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }
  }
  
  // Si no hay versión actual o no se encuentra el archivo, servir el index.html por defecto
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 