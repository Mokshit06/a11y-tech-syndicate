import type { ThemeConfig } from '@chakra-ui/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

const config: ThemeConfig = {
  initialColorMode: 'light',
};

const theme = extendTheme({
  config,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
