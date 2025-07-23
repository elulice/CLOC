const path = require('path');
const fs = require('fs');

const VERSIONS_DIR = path.join(__dirname, '../../versions');
const CURRENT_VERSION_FILE = path.join(__dirname, '../../current-version.json');

// Asegurarse de que el directorio de versiones existe
if (!fs.existsSync(VERSIONS_DIR)) {
  fs.mkdirSync(VERSIONS_DIR, { recursive: true });
}

// Función para obtener la versión actual
const getCurrentVersion = () => {
  try {
    if (fs.existsSync(CURRENT_VERSION_FILE)) {
      return JSON.parse(fs.readFileSync(CURRENT_VERSION_FILE, 'utf8'));
    }
    return null;
  } catch (error) {
    console.error('Error al leer la versión actual:', error);
    return null;
  }
};

// Función para establecer la versión actual
const setCurrentVersion = (versionId) => {
  try {
    const versionDir = path.join(VERSIONS_DIR, versionId);
    if (!fs.existsSync(versionDir)) {
      console.error('La versión no existe:', versionId);
      return false;
    }

    fs.writeFileSync(CURRENT_VERSION_FILE, JSON.stringify({ versionId }));
    return true;
  } catch (error) {
    console.error('Error al establecer la versión actual:', error);
    return false;
  }
};

// Función para crear una nueva versión
const createVersion = async (versionName, versionNumber = null) => {
  const versionId = versionNumber || Date.now().toString();
  const versionDir = path.join(VERSIONS_DIR, versionId);
  
  try {
    // Crear directorio para la nueva versión
    fs.mkdirSync(versionDir, { recursive: true });
    
    // Copiar archivos necesarios
    const filesToCopy = [
      'src',
      'public',
      'package.json',
      'package-lock.json',
      'tailwind.config.js',
      'postcss.config.js'
    ];
    
    for (const file of filesToCopy) {
      const sourcePath = path.join(__dirname, '../../', file);
      const targetPath = path.join(versionDir, file);
      
      if (fs.existsSync(sourcePath)) {
        if (fs.lstatSync(sourcePath).isDirectory()) {
          fs.cpSync(sourcePath, targetPath, { recursive: true });
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }
    
    // Guardar metadatos de la versión
    const versionData = {
      id: versionId,
      name: versionName,
      version: versionNumber || '1.0.0',
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(versionDir, 'version.json'),
      JSON.stringify(versionData, null, 2)
    );
    
    return versionData;
  } catch (error) {
    console.error('Error al crear la versión:', error);
    throw error;
  }
};

// Función para listar todas las versiones
const listVersions = () => {
  try {
    const versions = [];
    const versionDirs = fs.readdirSync(VERSIONS_DIR);
    
    for (const dir of versionDirs) {
      const versionFile = path.join(VERSIONS_DIR, dir, 'version.json');
      if (fs.existsSync(versionFile)) {
        versions.push(JSON.parse(fs.readFileSync(versionFile, 'utf8')));
      }
    }
    
    return versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error al listar versiones:', error);
    return [];
  }
};

// Función para eliminar una versión
const deleteVersion = (versionId) => {
  try {
    const versionDir = path.join(VERSIONS_DIR, versionId);
    if (fs.existsSync(versionDir)) {
      fs.rmSync(versionDir, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar la versión:', error);
    return false;
  }
};

module.exports = {
  VERSIONS_DIR,
  getCurrentVersion,
  setCurrentVersion,
  createVersion,
  listVersions,
  deleteVersion
}; 