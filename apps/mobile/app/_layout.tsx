import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="test" options={{ title: 'NFTicket Test' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}