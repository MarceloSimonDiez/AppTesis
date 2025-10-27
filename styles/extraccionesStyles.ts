// styles/extraccionesStyles.ts
import { StyleSheet } from "react-native";
import {
  responsiveFontSize as rf,
  responsiveWidth as rw,
  responsiveHeight as rh,
} from "react-native-responsive-dimensions";

const extraccionesStyles = StyleSheet.create({
  extraccionesScreenContainer: {
    flex: 1,
    backgroundColor: "white",
  },

  // --- Tarjeta superior ---
  topBarCard: {
    backgroundColor: "rgb(57, 0, 118)",
    borderBottomLeftRadius: rw(6),
    borderBottomRightRadius: rw(6),
    paddingVertical: rh(2),
    paddingHorizontal: rw(5),
    elevation: 4,
  },

  title: {
    color: '#FFF',
    fontSize: rf(2),
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#FFF',
    fontSize: rf(2),
    textAlign: 'center',
    marginTop: rh(0.5),
  },

  // --- Fila de filtros ---
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: rh(1),
    marginBottom: rh(2),
    paddingHorizontal: rw(4),
  },

  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(2),
  },

  filterButtonActive: {
    borderRadius: rw(2),
    paddingVertical: rh(1.2),
    paddingHorizontal: rw(3),
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // opcional para destacar visualmente
  },

  filterText: {
    fontSize: rf(1.3),
    color: '#aaa',
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  filterUnderline: {
    marginTop: rh(0.3),
    height: rh(0.4),
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: rh(1),
  },

  // ❌ Botón de cierre (abort)
  abortButton: {
    position: 'absolute',
    top: rh(2),
    right: rw(4),
    width: rw(10),
    height: rw(10),
    borderRadius: rw(5),
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 10,
  },

  // 📤 Contenedor de botones al final (ej: "Exportar Datos")
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: rh(2),
    left: rw(4),
    right: rw(4),
  },
});

export default extraccionesStyles;
