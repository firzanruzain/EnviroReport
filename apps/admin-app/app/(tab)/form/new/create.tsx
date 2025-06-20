import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { MainScreenLayout, Card, Heading } from "ui";
import { Snackbar, TextInput } from "react-native-paper";
import { useTheme } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useFormStore } from "modules";

export default function create() {
  const theme = useTheme();
  const pollution_type_id = useLocalSearchParams().typeId as string;
  // 1. State for form name and description
  const [formName, setFormName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const { createNewForm } = useFormStore();

  // 3. Callback to create form
  const handleCreateForm = async () => {
    if (formName.trim() == "") {
      return setScreenError("Form Name is Empty");
    } else if (description.trim() == "") {
      return setScreenError("Description is Empty");
    }
    setLoading(true);
    try {
      const newForm = await createNewForm(
        pollution_type_id,
        formName,
        description
      );
      if (newForm) {
        alert("Form Created Sucessfully");
        router.replace({
          pathname: "/(tab)/form/edit",
          params: { formId: newForm.form_template_id },
        });
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      alert(err.message || "Failed to create form");
    }
  };

  return (
    <MainScreenLayout
      heading={<Heading enableBackButton title={"New Form Details"} />}
    >
      <View className="flex-1">
        <Card className="p-5">
          <Text className="text-xl font-pBold text-dark-Default">Name</Text>
          <TextInput
            placeholder="Form Name"
            mode="outlined"
            outlineColor={theme.colors.primary}
            style={{ marginBottom: 10 }}
            value={formName}
            onChangeText={setFormName}
          ></TextInput>
          <Text className="text-xl font-pBold text-dark-Default">
            Description
          </Text>
          <TextInput
            placeholder="Form Description"
            mode="outlined"
            outlineColor={theme.colors.primary}
            style={{ marginBottom: 10 }}
            value={description}
            onChangeText={setDescription}
          ></TextInput>
          <TouchableOpacity
            onPress={handleCreateForm}
            disabled={loading}
            className="bg-primary-Default p-4 mt-4 rounded-lg justify-center items-center "
          >
            <Text className="text-Secondary-Default font-pBold text-xl">
              {loading ? "Saving Form..." : "Create"}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Error Snackbar */}
        <Snackbar
          visible={!!screenError}
          onDismiss={() => setScreenError(null)}
          action={{
            label: "Dismiss",
            onPress: () => setScreenError(null),
          }}
          duration={5000}
        >
          {screenError}
        </Snackbar>
      </View>
    </MainScreenLayout>
  );
}
