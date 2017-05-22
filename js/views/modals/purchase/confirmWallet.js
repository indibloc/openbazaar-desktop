import $ from 'jquery';
import app from '../../../app';
import loadTemplate from '../../../utils/loadTemplate';
import BaseVw from '../../baseVw';
import { integerToDecimal } from '../../../utils/currency';

export default class extends BaseVw {
  constructor(options = {}) {
    if (!options.displayCurrency) {
      throw new Error('Please provide a display currency.');
    }

    super(options);
    this.options = options;
    this.fee = false;

    this.confirmedAmount = app.walletBalance.get('confirmed');

    // re-render if the confirmed amount in the wallet changes
    this.listenTo(app.walletBalance, 'change:confirmed', (md, confirmedAmount) => {
      this.confirmedAmount = confirmedAmount;
      this.render();
    });

    // fetch the estimated fee and rerender when it returns
    this.fetchEstimatedFee = $.get(app.getServerUrl('wallet/estimatefee/?feeLevel=NORMAL'))
      .done(data => {
        this.fee = integerToDecimal(data, true);
        this.render();
      })
      .fail(() => {
        this.fee = false;
      });
  }

  className() {
    return 'confirmWallet';
  }

  events() {
    return {
      'click .js-confirmWalletCancel': 'clickWalletCancel',
      'click .js-confirmWalletConfirm': 'clickWalletConfirm',
    };
  }

  clickWalletCancel() {
    this.trigger('walletCancel');
  }

  clickWalletConfirm() {
    this.trigger('walletConfirm');
  }

  render() {
    loadTemplate('modals/purchase/confirmWallet.html', (t) => {
      this.$el.html(t({
        displayCurrency: this.options.displayCurrency,
        amount: this.options.amount,
        amountBTC: this.options.amountBTC,
        confirmedAmount: this.confirmedAmount,
        fee: this.fee,
      }));
    });

    return this;
  }
}
