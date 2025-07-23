const { createVersion, setCurrentVersion } = require('../config/versionConfig');

async function createNewVersion() {
  const versionNumber = process.argv[2];
  const versionName = process.argv[3];

  if (!versionNumber || !versionName) {
    console.error('Uso: node createVersion.js <número_versión> "<nombre_versión>"');
    process.exit(1);
  }

  try {
    console.log(`Creando versión ${versionNumber}...`);
    const version = await createVersion(versionName, versionNumber);
    console.log('Versión creada:', version);

    console.log('Estableciendo como versión actual...');
    setCurrentVersion(version.id);
    console.log(`Versión ${versionNumber} establecida como actual`);

    console.log(`¡Versión ${versionNumber} creada con éxito!`);
  } catch (error) {
    console.error('Error al crear la versión:', error);
    process.exit(1);
  }
}

createNewVersion(); 