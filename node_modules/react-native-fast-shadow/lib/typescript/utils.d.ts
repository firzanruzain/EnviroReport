import { ColorValue, ViewStyle } from 'react-native';
export declare type ShadowParams = {
    color?: ColorValue;
    opacity?: number;
    radius?: number;
    offset?: [number, number];
};
/**
 * Utility function to ensure that shadows look the same accross all platforms (iOS, android, web).
 * Rationale: for some reasons, the shadow radius on iOS looks like too large by a factor of 2.
 * To keep shadows consistent, this function will divide the shadow radius by 2 on iOS.
 */
export declare function shadowStyle({ color, opacity, radius, offset, }: ShadowParams): ViewStyle;
//# sourceMappingURL=utils.d.ts.map