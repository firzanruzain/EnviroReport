"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShadowedView = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _FastShadowView = require("./FastShadowView");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
class ShadowedView extends _react.default.Component {
  render() {
    const {
      style,
      children
    } = this.props;
    const child = /*#__PURE__*/_react.default.isValidElement(children) ? children : undefined;
    const cornerRadii = getCornerRadiiFromStyle(style) ?? getCornerRadiiFromStyle(child === null || child === void 0 ? void 0 : child.props.style) ?? {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };
    return /*#__PURE__*/_react.default.createElement(_FastShadowView.FastShadowView, _extends({}, this.props, {
      cornerRadii: cornerRadii
    }));
  }
}
exports.ShadowedView = ShadowedView;
function getCornerRadiiFromStyle(style) {
  const borderRadiusProps = ['borderRadius', 'borderTopLeftRadius', 'borderTopStartRadius', 'borderTopRightRadius', 'borderTopEndRadius', 'borderBottomLeftRadius', 'borderBottomStartRadius', 'borderBottomRightRadius', 'borderBottomEndRadius'];
  const s = _reactNative.StyleSheet.flatten(style) ?? {};
  if (!s.backgroundColor && !borderRadiusProps.some(prop => s[prop] !== undefined)) {
    return undefined;
  }
  return {
    topLeft: (_reactNative.I18nManager.isRTL ? s.borderTopEndRadius : s.borderTopStartRadius) ?? s.borderTopLeftRadius ?? s.borderRadius ?? 0,
    topRight: (_reactNative.I18nManager.isRTL ? s.borderTopStartRadius : s.borderTopEndRadius) ?? s.borderTopRightRadius ?? s.borderRadius ?? 0,
    bottomLeft: (_reactNative.I18nManager.isRTL ? s.borderBottomEndRadius : s.borderBottomStartRadius) ?? s.borderBottomLeftRadius ?? s.borderRadius ?? 0,
    bottomRight: (_reactNative.I18nManager.isRTL ? s.borderBottomStartRadius : s.borderBottomEndRadius) ?? s.borderBottomRightRadius ?? s.borderRadius ?? 0
  };
}
//# sourceMappingURL=ShadowedView.android.js.map