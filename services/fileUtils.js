import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

// 🔐 Pedir permiso para escribir en almacenamiento externo (solo Android < 11)
export const pedirPermisoEscritura = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

// 💾 Guardar un archivo CSV en la carpeta de Descargas del usuario
export const guardarCSVenDescargas = async (nombreArchivo, contenidoCSV) => {


  const path = `${RNFS.DownloadDirectoryPath}/${nombreArchivo}`;

  try {
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.unlink(path); // 🔥 Borra si ya existía
    }

    await RNFS.writeFile(path, contenidoCSV, 'utf8');
    console.log(`✅ CSV guardado en Descargas: ${path}`);
    return path;
  } catch (err) {
    console.log("❌ Error al guardar CSV en Descargas:", err);
    return null;
  }
};
