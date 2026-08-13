/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

global.self = global;

jest.mock('@ant-design/react-native', () => {
  const React = require('react');
  const ReactNative = require('react-native');
  const Card = ({ children, ...props }) =>
    React.createElement(ReactNative.View, props, children);
  Card.Header = ({ title, ...props }) =>
    React.createElement(ReactNative.Text, props, title);
  Card.Body = ({ children, ...props }) =>
    React.createElement(ReactNative.View, props, children);
  return {
    Button: ({ children, onPress, ...props }) =>
      React.createElement(ReactNative.Pressable, { ...props, onPress }, children),
    Card,
    Provider: ({ children }) => children,
    Text: ReactNative.Text,
    Toast: { show: jest.fn() },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key => storage.get(key) ?? null),
      removeItem: jest.fn(async key => storage.delete(key)),
      setItem: jest.fn(async (key, value) => storage.set(key, value)),
    },
  };
});

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly' },
  getGenericPassword: jest.fn(async () => false),
  resetGenericPassword: jest.fn(async () => true),
  setGenericPassword: jest.fn(async () => ({ service: 'test' })),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
