// styles/buttonStyles.ts
import { StyleSheet } from 'react-native';

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: '#46004B',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default buttonStyles;