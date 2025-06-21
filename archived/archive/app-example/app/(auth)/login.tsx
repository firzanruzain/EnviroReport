import { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert
} from "react-native";
import { Link, useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import images from "../../constants/images"

type inputprop = {
  placeholder: string;
  secureTextEntry?: boolean;
  textContentType?: string;
  keyboardType?: any;
  value?: string;
  onChangeText?: any;
};

function Input({ placeholder, secureTextEntry, keyboardType='default', value, onChangeText }:inputprop) {
  return (
    <TextInput
      className="bg-Secondary-100 h-[52px] w-[295px] px-10 pr-16 rounded-full font-pMedium my-2"
      autoCapitalize="none"
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      value={value}
      onChangeText={onChangeText}
    ></TextInput>
  );
}

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonEnabled, enableButton] = useState(false);
  const router = useRouter();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }

  useEffect(() => {
    if (!(email && password)){
      enableButton(true);
    }else{
      enableButton(false);
    }
  }, [email, password]);
  
  const signUp = async () => {
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      alert("Check your emails!");
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Sign in failed: " + err.message);
      Alert.alert('Sign in Failed', err.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-Secondary-Default h-full flex-1 justify-center items-center">
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={"dark-content"}
      />
      <Image
        className="absolute bottom-[400px] left-[50px]"
        source={images.light}
      ></Image>
      <Image
        className="absolute top-[400px] right-[70px]"
        source={images.light}
      ></Image>
      <Image
        resizeMode="contain"
        className="absolute opacity-40 w-[966px] h-[683px]"
        source={images.earthimage}
      ></Image>
      <Text className="text-[36px] font-pBold text-primary-Default">
        Welcome Back!
      </Text>
      <KeyboardAvoidingView className="my-10">
        <Input
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder={"Email"}
        ></Input>
        <View className="justify-center">
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder={"Password"}
          ></Input>
          <MaterialCommunityIcons
            className="absolute right-6"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#aaa"
            onPress={toggleShowPassword}
          />
        </View>
      </KeyboardAvoidingView>
      {loading ? (
        <ActivityIndicator size={"small"} style={{ margin: 28 }} />
      ) : (
        <>
          <View className="w-full justify-center items-center">
            <TouchableOpacity
              disabled={buttonEnabled}
              onPress={signIn}
              className={
                !buttonEnabled
                  ? "bg-primary-100 rounded-full justify-center h-[52px] w-[295px] mx-8 mb-8"
                  : "bg-gray-500 rounded-full justify-center h-[52px] w-[295px] mx-8 mb-8"
              }
            >
              <Text className="text-center text-[18px] text-Secondary-100 font-pSemiBold">
                Log In
              </Text>
            </TouchableOpacity>
            <Link
              replace
              href={"/signup"}
              className="text-center underline font-pBold text-black"
            >
              Don't have an account? Sign Up
            </Link>
            <Link
              replace
              href={"/(admin)/dashboard"}
              className="text-center underline font-pBold text-black my-4"
            >
              Admin Login
            </Link>
          </View>
        </>
      )}
    </SafeAreaView>
    // <View style={styles.container}>
    //   <KeyboardAvoidingView behavior="padding">
    //     <TextInput
    //       style={styles.input}
    //       value={email}
    //       onChangeText={setEmail}
    //       autoCapitalize="none"
    //       keyboardType="email-address"
    //       placeholder="Email"
    //     />
    //     <TextInput
    //       style={styles.input}
    //       value={password}
    //       onChangeText={setPassword}
    //       secureTextEntry
    //       placeholder="Password"
    //     />
    //     {loading ? (
    //       <ActivityIndicator size={"small"} style={{ margin: 28 }} />
    //     ) : (
    //       <>
    //         <Button onPress={signIn} title="Login" />
    //         <Button onPress={signUp} title="Create account" />
    //       </>
    //     )}
    //   </KeyboardAvoidingView>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
});
