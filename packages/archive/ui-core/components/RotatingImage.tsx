// components/RotatingImage.tsx
import React, { useEffect } from "react";
import { ImageSourcePropType } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

type RotatingImageProps = {
  source: ImageSourcePropType;
  size?: number;
  className?: string;
  duration?: number;
};

const RotatingImage: React.FC<RotatingImageProps> = ({
  source,
  size = 100,
  className,
  duration = 2500,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: duration,
        easing: Easing.linear, // constant speed
      }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <Animated.Image
      source={source}
      className={`${className}`}
      style={[{ width: size, height: size }, animatedStyle]}
      resizeMode="contain"
    />
  );
};

export default RotatingImage;
