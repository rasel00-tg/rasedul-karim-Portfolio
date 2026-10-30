export {
  isDeviceBiometricAvailable as isBiometricAvailable,
  isDeviceBiometricEnrolled as isBiometricEnrolled,
  registerDeviceBiometric as registerBiometric,
  verifyDeviceBiometricLogin as verifyBiometricLogin,
  disableDeviceBiometric as disableBiometric
} from './biometricDeviceAuth';

export * from './biometricDeviceAuth';
