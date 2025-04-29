// This file is part of the shared-ui package.
// It is subject to the license terms in the LICENSE file found in the top-level directory of this distribution.
import Container from "../components/Container";
import Field from "../components/Field";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useEffect, useState } from "react";

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
      <Field placeholder="Email" />
      <Field
        secureTextEntry={true}
        placeholder={"Password"}
        toggleButton={
          <MaterialCommunityIcons
            className="absolute right-6"
            name={true ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#aaa"
          />
        }
      />

      <Button
        variant="primary"
        onPress={() => {
          console.log("login");
        }}
        title="Login"
      />
    </Container>
  );
}
