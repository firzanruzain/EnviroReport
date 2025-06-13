import { useTheme } from "react-native-paper";
import React from 'react'
import {Report} from "models"
import {MainScreenScrollLayout, Heading, ReportDetails} from 'ui'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ReportPage({report}:{report:Report | undefined}) {
    const theme = useTheme();
    const router = useRouter();
  return (
    <MainScreenScrollLayout
      heading={
        <Heading title={report?.form_template?.form_name || ""}
          left={<MaterialCommunityIcons
            color={theme.colors.primary}
            name="chevron-left"
            size={30}
            onPress={()=> router.back()}
          />}
          right={
            <MaterialCommunityIcons
            color={theme.colors.primary}
            name="dots-vertical"
            size={30}
          />
          }
        />
      }
    >
      {report && <ReportDetails report={report}/>}
    </MainScreenScrollLayout>
  )
}