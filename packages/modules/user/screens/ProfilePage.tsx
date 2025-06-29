import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native";
import {
  Heading,
  MainScreenLayout,
  MainScreenScrollLayout,
  ConfirmDialog,
  ConfirmDialogRef,
} from "ui";
import React, { useState, useRef } from "react";
import { useUserStore } from "../useUserStore";
import { Profile } from "../../../models/user";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { supabase } from "services";
import { useRouter } from "expo-router";

const Field = ({
  label,
  value,
  editable,
  onChange,
  fieldKey,
  error,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (field: keyof Profile, value: string) => void;
  fieldKey: keyof Profile;
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
}) => (
  <View>
    <Text className="text-dark-Default font-pBold text-lg">{label}</Text>
    <TextInput
      selectTextOnFocus
      className={
        !editable
          ? "text-black font-pMedium text-lg"
          : "text-dark font-pMedium text-lg border-2 border-normal px-2 py-1 rounded-xl"
      }
      value={value}
      editable={editable}
      onChangeText={(v) => onChange(fieldKey, v)}
      keyboardType={keyboardType}
    />
    {editable && error && (
      <Text className="text-red-400 font-pSemiBold text-lg">{error}</Text>
    )}
  </View>
);

export default function ProfilePage() {
  const { user, updateProfile, resetUser } = useUserStore();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(user?.profile ?? null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutDialogRef = useRef<ConfirmDialogRef>(null);
  const router = useRouter();

  React.useEffect(() => {
    setProfile(user?.profile ?? null);
  }, [user]);

  const handleChange = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    let errorMsg = null;
    if (field === "name") errorMsg = validateName(value);
    else if (field === "identity_card_num")
      errorMsg = validateIdentityCard(value.toString());
    else if (field === "age") errorMsg = validateAge(value.toString());
    else if (field === "phone_number") errorMsg = validatePhone(value);
    else if (field === "address") errorMsg = validateAddress(value);
    setErrors((prev: any) => ({ ...prev, [field]: errorMsg }));
  };

  const validateAll = () => {
    if (!profile) return {};
    const errs: any = {};
    errs.name = validateName(profile.name);
    errs.identity_card_num = validateIdentityCard(
      profile.identity_card_num.toString()
    );
    errs.age = validateAge(profile.age.toString());
    errs.phone_number = validatePhone(profile.phone_number ?? "");
    errs.address = validateAddress(profile.address ?? "");
    return errs;
  };

  const handleSave = async () => {
    if (!profile) return;
    const validationErrors = validateAll();
    setErrors(validationErrors);
    const hasError = Object.values(validationErrors).some((e) => !!e);
    if (hasError) return;
    setLoading(true);
    try {
      const updated = await updateProfile(profile);
      if (updated) {
        setEditMode(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <MainScreenLayout heading={<Heading title={"Profile"} />}>
        <Text>No profile data found.</Text>
      </MainScreenLayout>
    );
  }

  const fieldsConfig: {
    key: keyof Profile;
    label: string;
    keyboardType: KeyboardTypeOptions;
  }[] = [
    {
      key: "name",
      label: "Name",
      keyboardType: "default",
    },
    {
      key: "identity_card_num",
      label: "Identity Card Number",
      keyboardType: "numeric",
    },
    {
      key: "age",
      label: "Age",
      keyboardType: "numeric",
    },
    {
      key: "phone_number",
      label: "Phone Number",
      keyboardType: "phone-pad",
    },
    {
      key: "address",
      label: "Address",
      keyboardType: "default",
    },
  ];

  return (
    <MainScreenScrollLayout heading={<Heading title={"Profile"} />}>
      <View className=" bg-Secondary-Default p-4 flex-col gap-4 rounded-xl">
        {fieldsConfig.map((f) => (
          <Field
            key={f.key}
            label={f.label}
            value={
              profile && profile[f.key] !== undefined
                ? profile[f.key]?.toString() ?? ""
                : ""
            }
            editable={editMode}
            onChange={handleChange}
            fieldKey={f.key}
            error={errors[f.key]}
            keyboardType={f.keyboardType}
          />
        ))}
        <TouchableOpacity
          onPress={editMode ? handleSave : () => setEditMode(true)}
          className="w-[20%] p-2  border-normal border-2 absolute right-0 rounded-lg justify-center items-center"
        >
          <Text className="font-pBold text-dark-Default text-md">
            {loading ? "Saving..." : editMode ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="w-full p-2 justify-center items-center  rounded-xl my-4 bg-primary-Default"
        onPress={() => logoutDialogRef.current?.open()}
      >
        <Text className="text-2xl text-Secondary-100 font-pBold">Log Out</Text>
      </TouchableOpacity>
      <ConfirmDialog
        ref={logoutDialogRef}
        confirm={async () => {
          setLogoutLoading(true);
          setLogoutError(null);
          try {
            await supabase.auth.signOut();
          } catch (err: any) {
            setLogoutError(err?.message || "Logout failed");
          } finally {
            setLogoutLoading(false);
          }
        }}
        loading={logoutLoading}
        error={logoutError}
        title="Log Out"
        message="Are you sure you want to log out?"
        buttonText="Log Out"
      />
    </MainScreenScrollLayout>
  );
}

function validateName(value: string): string | null {
  if (!value) return "Name is required";
  if (value.length < 2) return "Name must be at least 2 characters";
  return null;
}

function validateIdentityCard(value: string): string | null {
  if (!value) return "Identity Card is required";
  const idRegex = /^[a-zA-Z0-9]{12}$/;
  if (!idRegex.test(value))
    return "Identity Card must be 12 alphanumeric characters";
  return null;
}

function validateAge(value: string): string | null {
  if (!value) return "Age is required";
  const num = Number(value);
  if (isNaN(num) || num < 0) return "Age must be a valid number";
  return null;
}

function validatePhone(value: string): string | null {
  if (!value) return null;
  const phoneRegex = /^\+?\d{7,15}$/;
  if (!phoneRegex.test(value)) return "Invalid phone number";
  return null;
}

function validateAddress(value: string): string | null {
  if (!value) return null;
  if (value.length < 5) return "Address must be at least 5 characters";
  return null;
}
