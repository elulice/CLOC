const { createVersion, setCurrentVersion } = require('../config/versionConfig');

async function initializeVersion() {
  try {
    console.log('Creando versión 1.0.0...');
    const version = await createVersion('Versión 1.0.0', '1.0.0');
    console.log('Versión creada:', version);

    console.log('Estableciendo como versión actual...');
    setCurrentVersion(version.id);
    console.log('Versión 1.0.0 establecida como actual');

    console.log('¡Versión 1.0.0 inicializada con éxito!');
  } catch (error) {
    console.error('Error al inicializar la versión:', error);
    process.exit(1);
  }
}

initializeVersion(); 