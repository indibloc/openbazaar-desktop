import app from '../app';
import { events as currencyEvents, fetchExchangeRates } from '../utils/currency';

// How often to fetch the rates. The server only fetches them every so often
// (currently 15 seconds), so it would be pointless to fetch them more often
// than that.
const fetchInterval = 15 * 1000;

// Flag to indicate if rates have been successfully fetched at least once.
let fetchRatesTimeout;
let statusBarMsg;
let failLaterTimeout;
let removeStatusMsgTimout;
let succeedLaterTimeout;

function setRetryStatus(msg = {}) {
  const statusMsgOpts = {
    duration: 9999999999,
    ...msg,
  };

  if (!statusBarMsg) {
    statusBarMsg = app.statusBar.pushMessage(statusMsgOpts);
    statusBarMsg.on('clickRetry', () => (fetchExchangeRates()));
  } else {
    statusBarMsg.update(msg);
  }

  return statusBarMsg;
}

currencyEvents.on('fetching-exchange-rates', (e) => {
  if (statusBarMsg) {
    setRetryStatus({
      type: 'message',
      msg: app.polyglot.t('exchangeRatesSyncer.fetchingRatesStatusMsg'),
    });
  }

  clearTimeout(fetchRatesTimeout);
  clearTimeout(succeedLaterTimeout);
  clearTimeout(removeStatusMsgTimout);
  clearTimeout(failLaterTimeout);

  e.xhr.done(() => {
    if (statusBarMsg) {
      // Defer success state, otherwise it's an odd little flicker if
      // the call came back too fast.
      succeedLaterTimeout = setTimeout(() => {
        setRetryStatus({
          type: 'message',
          msg: app.polyglot.t('exchangeRatesSyncer.fetchingRatesSuccessStatusMsg'),
        });

        removeStatusMsgTimout = setTimeout(() => {
          statusBarMsg.remove();
          statusBarMsg = null;
        }, 3000);
      }, 300);
    }

    fetchRatesTimeout = setTimeout(() => {
      fetchExchangeRates();
    }, fetchInterval);
  }).fail(() => {
    if (statusBarMsg) {
      // If the status bar already exists, we'll delay before updating it with a failure
      // state, because if the fail happens really fast, it looks like nothing happend.
      failLaterTimeout = setTimeout(() => {
        setRetryStatus({
          type: 'warning',
          msg: app.polyglot.t('exchangeRatesSyncer.fetchingRatesFailStatusMsg',
            { retryLink: '<a class="js-retry">Retry</a>' }),
        });
      }, 300);
    } else {
      setRetryStatus({
        type: 'warning',
        msg: app.polyglot.t('exchangeRatesSyncer.fetchingRatesFailStatusMsg',
          { retryLink: '<a class="js-retry">Retry</a>' }),
      });
    }
  });
});
