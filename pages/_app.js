import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import ShutdownNotice from '../components/shutdownNotice'

import lightTheme from '../theme/light';
import darkTheme from '../theme/dark';

import Configure from './configure'

import stores from '../stores/index.js'

import {
  CONFIGURE,
  CONFIGURE_RETURNED,
  SWAP_CONFIGURED,
  ACCOUNT_CONFIGURED,
} from '../stores/constants'

export default function MyApp({ Component, pageProps }) {
  const [ themeConfig, setThemeConfig ] = useState(lightTheme);
  const [ accountConfigured, setAccountConfigured ] = useState(false)
  const [ swapConfigured, setSwapConfigured ] = useState(false)

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const changeTheme = (dark) => {
    setThemeConfig(dark ? darkTheme : lightTheme)
    localStorage.setItem('yearn.finance-dark-mode', dark ? 'dark' : 'light')
  }

  const accountConfigureReturned = () => {
    setAccountConfigured(true)
  }

  const swapConfigureReturned = () => {
    setSwapConfigured(true)
  }

  useEffect(function() {
    const localStorageDarkMode = window.localStorage.getItem('yearn.finance-dark-mode')
    changeTheme(localStorageDarkMode ? localStorageDarkMode === 'dark' : false)
  },[]);

  useEffect(function() {
    stores.emitter.on(SWAP_CONFIGURED, swapConfigureReturned)
    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigureReturned)

    stores.dispatcher.dispatch({ type: CONFIGURE })

    return () => {
      stores.emitter.removeListener(SWAP_CONFIGURED, swapConfigureReturned)
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigureReturned)
    }
  },[]);

  const [shutdownNoticeOpen, setShutdownNoticeOpen] = useState(false);
  const closeShutdown = () => {
    setShutdownNoticeOpen(false)
  }

  return (
    <React.Fragment>
      <Head>
        <title>Multichain</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={ themeConfig }>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {
          swapConfigured && accountConfigured && <Component {...pageProps} changeTheme={ changeTheme } />
        }
        {
          !(swapConfigured && accountConfigured) && <Configure {...pageProps} />
        }
        { shutdownNoticeOpen &&
          <ShutdownNotice close={ closeShutdown } />
        }
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
