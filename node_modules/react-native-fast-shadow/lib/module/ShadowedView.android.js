function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React from 'react';
import { I18nManager, StyleSheet } from 'react-native';
import { FastShadowView } from './FastShadowView';
export class ShadowedView extends React.Component {
  render() {
    const {
      style,
      children
    } = this.props;
    const child = /*#__PURE__*/React.isValidElement(children) ? children : undefined;
    const cornerRadii = getCornerRadiiFromStyle(style) ?? getCornerRadiiFromStyle(child === null || child === void 0 ? void 0 : child.props.style) ?? {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };
    return /*#__PURE__*/React.createElement(FastShadowView, _extends({}, this.props, {
      cornerRadii: cornerRadii
    }));
  }
}
function getCornerRadiiFromStyle(style) {
  const borderRadiusProps = ['borderRadius', 'borderTopLeftRadius', 'borderTopStartRadius', 'borderTopRightRadius', 'borderTopEndRadius', 'borderBottomLeftRadius', 'borderBottomStartRadius', 'borderBottomRightRadius', 'borderBottomEndRadius'];
  const s = StyleSheet.flatten(style) ?? {};
  if (!s.backgroundColor && !borderRadiusProps.some(prop => s[prop] !== undefined)) {
    return undefined;
  }
  return {
    topLeft: (I18nManager.isRTL ? s.borderTopEndRadius : s.borderTopStartRadius) ?? s.borderTopLeftRadius ?? s.borderRadius ?? 0,
    topRight: (I18nManager.isRTL ? s.borderTopStartRadius : s.borderTopEndRadius) ?? s.borderTopRightRadius ?? s.borderRadius ?? 0,
    bottomLeft: (I18nManager.isRTL ? s.borderBottomEndRadius : s.borderBottomStartRadius) ?? s.borderBottomLeftRadius ?? s.borderRadius ?? 0,
    bottomRight: (I18nManager.isRTL ? s.borderBottomStartRadius : s.borderBottomEndRadius) ?? s.borderBottomRightRadius ?? s.borderRadius ?? 0
  };
}
//# sourceMappingURL=ShadowedView.android.js.map