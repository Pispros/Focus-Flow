import { Stack } from "expo-router"

const WelcomeStacks = () => {
    return <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
}

export default WelcomeStacks;