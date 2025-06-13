import { View, Text } from 'react-native'
import React from 'react'

const StatusTag = ({status}:{status:string}) => {
  return (
    <View
              className="rounded-full items-center justify-center px-1"
              style={{
                backgroundColor:
                  status === "In Review"
                    ? "#b2f58a"
                    : status === "Pending"
                    ? "#f5d08a"
                    : "lightgrey"
              }}
            >
              <Text className="font-pMedium text-sm">{status}</Text>
            </View>
  )
}

export default StatusTag