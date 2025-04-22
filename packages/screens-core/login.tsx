// This file is part of the shared-ui package.
// It is subject to the license terms in the LICENSE file found in the top-level directory of this distribution.
import Container from "../ui-core/components/Container";
import Field from "../ui-core/components/Field";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../ui-core/components/Button";
import { useEffect, useState } from "react";
import { Text} from "react-native"

export default function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonEnabled, enableButton] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (!(email && password)) {
      enableButton(true);
    } else {
      enableButton(false);
    }
  }, [email, password]);

//   const signIn = async () => {
//     setLoading(true);
//     try {
//       await auth().signInWithEmailAndPassword(email, password);
//     } catch (e: any) {
//       const err = e as FirebaseError;
//       alert("Sign in failed: " + err.message);
//       Alert.alert("Sign in Failed", err.code);
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <Container>
      <Text className="text-[36px] font-pBold text-primary-Default self-center my-14">
        Welcome Back!
      </Text>
      <Field
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Email"
      />
      <Field
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        placeholder={"Password"}
        toggleButton={
          <MaterialCommunityIcons
            className="absolute right-6"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#aaa"
            onPress={toggleShowPassword}
          />
        }
      />

      <Button
        disabled={buttonEnabled}
        variant="primary"
        onPress={() => {
          console.log("login");
        }}
        title={
          <Text className="text-center text-[18px] text-Secondary-100 font-pSemiBold">
            Log In
          </Text>
        }
      />
    </Container>
  );
}
