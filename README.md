# PPS PK-Timer (AppTesis) ⏱️🐾

Aplicación móvil híbrida desarrollada con **React Native** y **Expo** (SDK 52) diseñada para la gestión y control de tiempos en ensayos farmacocinéticos (PK) veterinarios. Permite definir grupos experimentales, esquemas de intervalos (tomas de muestras/extracciones de sangre), gestionar temporizadores individuales con notificaciones en tiempo real y exportar los resultados a plantillas de Excel (.xlsx) de manera local.

Este documento detalla los pasos para preparar un entorno de desarrollo desde cero en una computadora con **Ubuntu 22.04 LTS**, solucionar los problemas más comunes del emulador y compilar un paquete instalable (APK) de producción local.

---

## 1. Requisitos del Sistema
Para compilar y emular la aplicación correctamente en Linux, se requiere:
- **Sistema Operativo**: Ubuntu 22.04 LTS (o distribuciones basadas en Debian).
- **Procesador**: Con soporte para virtualización de hardware (KVM).
- **Memoria RAM**: 8 GB mínimo (se recomiendan 16 GB).
- **Espacio en Disco**: Al menos 15 GB libres (para el SDK de Android, herramientas de compilación y emuladores).

---

## 2. Preparación del Entorno de Desarrollo (Paso a Paso)

### Paso 2.1: Instalar Node.js v20 (LTS) usando NVM
Expo SDK 52 requiere Node.js v18 o superior. El Node por defecto en Ubuntu 22.04 suele ser obsoleto (v12).
1. Instale **Node Version Manager (NVM)**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```
2. Recargue su configuración de terminal:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```
3. Instale y configure Node v20 como predeterminado:
   ```bash
   nvm install 20
   nvm use 20
   nvm alias default 20
   ```
4. Verifique la versión activa:
   ```bash
   node -v # Debería retornar v20.x.x
   ```

### Paso 2.2: Instalar dependencias de compilación nativa (Java y Ninja)
React Native utiliza compilación nativa en C++ y Java.
1. Instale **OpenJDK 17**:
   ```bash
   sudo apt update
   sudo apt install -y openjdk-17-jdk
   ```
2. Instale **Ninja Build** (necesario para compilar dependencias C++ como react-native-gesture-handler y react-native-screens):
   ```bash
   sudo apt install -y ninja-build cmake
   ```

### Paso 2.3: Configurar KVM para aceleración del Emulador
1. Verifique soporte de virtualización CPU:
   ```bash
   egrep -c '(vmx|svm)' /proc/cpuinfo # Mayor que 0 significa soportado
   ```
2. Instale los componentes de KVM:
   ```bash
   sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager cpu-checker
   ```
3. Agregue su usuario a los grupos de KVM (para evitar ejecutar como root):
   ```bash
   sudo usermod -aG kvm $USER
   sudo usermod -aG libvirt $USER
   ```
   > [!IMPORTANT]
   > Debe cerrar sesión en Ubuntu y volver a iniciarla (o reiniciar la PC) para aplicar estos cambios de grupo. Para aplicarlo temporalmente en su terminal actual sin reiniciar, ejecute: `newgrp kvm`.

---

## 3. Instalación de Android Studio y SDK

1. Instale **Android Studio** desde snap:
   ```bash
   sudo snap install android-studio --classic
   ```
2. Inicie Android Studio y complete la instalación estándar.
3. Abra el **SDK Manager** (*More Actions -> SDK Manager*):
   - En **SDK Platforms**, asegúrese de marcar **Android 14.0 (UpsideDownCake) - API 34** y/o **Android 15.0 (VanillaIceCream) - API 35**.
   - En **SDK Tools** (marque *Show Package Details* abajo a la derecha):
     - Instale **Android SDK Command-line Tools (latest)**.
     - Instale **Android Emulator**.
     - Instale **Android SDK Platform-Tools**.

4. **Variables de entorno**: Abra su archivo `~/.bashrc` (`nano ~/.bashrc`) y agregue al final las siguientes líneas para registrar el SDK en el PATH del sistema:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```
   Aplique los cambios en su terminal actual:
   ```bash
   source ~/.bashrc
   ```

---

## 4. Creación y Optimización del Emulador Android (AVD)

Para simular dispositivos similares a los que usarán los veterinarios en campo (Android 11 / API 30), cree un emulador con las siguientes optimizaciones de espacio y rendimiento:

1. En Android Studio, abra **Virtual Device Manager** -> **Create Device**.
2. Seleccione un hardware (ej. **Pixel 5**) y pulse *Next*.
3. En la pestaña **x86 Images**, seleccione y descargue **API 30** (R con Google APIs) y pulse *Next*.
4. Nombre al emulador (ej: `Pixel_5_API_30`).

### Optimización de espacio (Límite de disco)
Por defecto, Android Studio puede asignar 10 GB o más de almacenamiento interno, provocando un error por falta de espacio (`FATAL | Not enough space to create userdata partition`).
- En la pantalla de creación, pulse **Show Advanced Settings**.
- En la sección **Memory and Storage**, cambie **Internal Storage** a **2048 MB** (2 GB).

### Optimización de velocidad (Aceleración de GPU por hardware)
Para evitar que el emulador corra en renderizado por CPU (software lento que congela el sistema y dispara la alerta de "Force Quit or Wait"):
- En la sección de configuración del emulador en Android Studio, cambie el modo de gráficos (**Graphics**) de `Automatic` a **`Hardware - GLES 2.0`**.
- *Alternativa de consola*: Si prefiere editar la configuración manualmente, abra el archivo `~/.android/avd/Pixel_5_API_30.avd/config.ini` y asegúrese de que tenga estas líneas:
  ```ini
  hw.gpu.enabled=yes
  hw.gpu.mode=host
  disk.dataPartition.size=2G
  ```

---

## 5. Levantar el Proyecto en Desarrollo

1. Clone el repositorio y navegue al directorio raíz `AppTesis`.
2. Instale dependencias (con su entorno de Node v20 activo):
   ```bash
   npm install
   ```
3. Inicie el emulador manualmente (o deje que Expo lo abra):
   ```bash
   emulator @Pixel_5_API_30
   ```
4. Compile y ejecute la aplicación en modo desarrollo local:
   ```bash
   npm run android
   ```

---

## 6. Compilación Local de una APK Distribuible (Producción)

Si necesita generar un archivo APK de producción directamente en su computadora sin depender de los servidores de la nube de Expo (EAS Build), siga estos pasos:

### Opción A: Compilar el APK directamente (Recomendado)
Puede utilizar el wrapper de Gradle (`gradlew`) ubicado dentro del directorio nativo de Android.

1. Navegue al directorio de Android:
   ```bash
   cd android
   ```
2. Ejecute el comando de ensamblado en variante de producción:
   ```bash
   ./gradlew assembleRelease
   ```
3. Una vez finalizada la compilación, su archivo APK instalable estará ubicado en:
   ```filepath
   android/app/build/outputs/apk/release/app-release.apk
   ```
   *Este APK puede copiarse directamente a cualquier teléfono Android para su instalación física.*

### Opción B: Compilar e Instalar localmente en modo release
Si desea compilar la versión de release e instalarla inmediatamente en el emulador o teléfono conectado para verificar el rendimiento final:
```bash
npx expo run:android --variant release
```

---

> [!WARNING]
> **NUNCA** ejecute el script `npm run reset-project` en este repositorio. Es una utilidad por defecto de las plantillas de Expo que destruirá la estructura de navegación e interfaces personalizadas de esta app para generar un proyecto vacío.

