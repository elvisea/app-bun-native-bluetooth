import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { StatusBar } from "expo-status-bar";
import { Device } from "react-native-ble-plx";

import BluetoothManager from "./manager/bluetooth";
import { requestPermissions } from "./manager/permissions";

const bluetoothManager = BluetoothManager.getInstance();

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  const [devices, setDevices] = useState<string[]>([]);

  console.log("devices?", devices);

  console.log("isGranted?", isGranted);
  console.log("isLoading?", isLoading);

  const solicitarPermissao = async () => {
    const response = await requestPermissions();
    setIsGranted(response);
  };

  const scanDevices =
    (onDevice: (device: Device) => void): BluetoothManager | undefined => {
      bluetoothManager.scanForDevices(onDevice);
      return bluetoothManager;

    };

  const handleScanDevices = useCallback(() => {
    setIsLoading(true);

    if (isGranted) {
      const manager = scanDevices((scan) =>
        setDevices((prevState) => Array.from(new Set([...prevState, scan.id]))),
      );

      const timeoutId = setTimeout(() => {
        manager?.stopScan();
        setIsLoading(false);
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
        manager?.stopScan();
        setIsLoading(false);
      };
    }


  }, [isGranted]);

  useEffect(() => {
    solicitarPermissao();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text>{isLoading ? "SCAN..." : `DEVICES: ${devices.length}`}</Text>

      <TouchableOpacity onPress={handleScanDevices} style={styles.button}>
        <Text style={styles.text}>
          {isLoading ? "Escaneando..." : "Procurar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={solicitarPermissao} style={styles.button}>
        <Text style={styles.text}>Solicitar Permissão</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#7159c1",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  text: {
    color: "#FFF",
  },
});
