import { View, Text, Image, TextInput } from 'react-native';
import React from 'react';
import images from '@/constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import CreateNewButton from '@/components/CreateNewButton';

const map = () => {
  return (
    <View className='h-full w-full items-center justify-start'>
      <CreateNewButton/>
      <Image className='absolute' source={images.map}></Image>
      <SafeAreaView className='my-6 flex-1 mx-2 w-[90%]'>
        <TextInput placeholderTextColor={'#ddfcad'} placeholder='Search' className='bg-primary-100 text-xl font-pMedium text-Secondary-100 p-6 rounded-full'></TextInput>
      </SafeAreaView>
    </View>
  );
}

export default map