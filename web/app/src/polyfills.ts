/**
 * jsencrypt 发布的 UMD 包会读取 `self`，React Native 默认只提供 globalThis。
 * 在任何请求层模块加载前建立最小的运行时兼容别名。
 */
import 'react-native-get-random-values';

const runtime = globalThis as typeof globalThis & { self?: typeof globalThis };

if (!runtime.self) {
  runtime.self = runtime;
}
