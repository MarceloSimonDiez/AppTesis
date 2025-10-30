import { PermissionsAndroid, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

/**
 * Guarda un archivo CSV en el caché y abre el menú nativo
 *para compartirlo o guardarlo en "Descargas".
 */
export const guardarCSVenDescargas = async (nombreArchivo, contenidoCSV) => {
  
  // 1. SOLUCIÓN AL PROBLEMA 2: Limpiar el nombre del archivo
  //    Eliminamos las comillas (") y cualquier otro caracter ilegal
  const nombreLimpio = nombreArchivo.replace(/"/g, '').replace(/[\/\\]/g, '_');
  
  // 2. SOLUCIÓN AL PROBLEMA 1: Usar el directorio de caché
  //    Esta es una ruta segura donde tu app SIEMPRE tiene permisos
  const uri = FileSystem.cacheDirectory + nombreLimpio;

  try {
    // 3. Escribir el archivo en el caché usando expo-file-system
    await FileSystem.writeAsStringAsync(uri, contenidoCSV, {
      encoding: FileSystem.EncodingType.UTF8
    });

    console.log(`✅ CSV guardado en caché: ${uri}`);

    // 4. Abrir el menú "Compartir" de Android/iOS
    //    Esto deja que el usuario elija guardarlo en Descargas
    await Sharing.shareAsync(uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Guardar CSV',
    });
    
    return uri;

  } catch (err) {
    console.log("❌ Error al guardar y compartir CSV:", err);
    return null;
  }
};
