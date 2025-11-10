import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = () => {
    // 1. Validación de campos vacíos
    if (usuario.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    // 2. Lógica de Validación (¡CRUCIAL! Debe ser admin/1234)
    if (usuario === 'admin' && password === '1234') {
      // Navegación exitosa al grupo de pestañas
      router.push('/(tabs)/homeScreen');
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.card}>

        {/* Logo de Hericraft (Imagen temporal) */}
        <Image
          style={styles.logo}
          source={{ uri: 'https://i.vimeocdn.com/video/1891854528-c4b262e781a0d0eac1ef5eac2785817f2c15eb1ea32fd505073cb59d31c45521-d?f=webp' }}
        />

        <Text style={styles.signInPrompt}>
          Inicia sesión con tu cuenta
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#666"
          value={usuario}
          onChangeText={setUsuario}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>Lost password?</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  card: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,

    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100,

    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  logo: {
    width: 180,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
    alignSelf: 'center',
  },
  signInPrompt: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    color: '#333',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0d6efd',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 15,
  },
  linkText: {
    color: '#0d6efd',
    fontSize: 14,
    fontWeight: '500',
  },
});