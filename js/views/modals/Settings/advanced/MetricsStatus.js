import app from '../../../../app';
import loadTemplate from '../../../../utils/loadTemplate';
import { showMetricsModal } from '../../../../utils/metrics';
import BaseVw from '../../../baseVw';

export default class extends BaseVw {
  constructor(options = {}) {
    super(options);

    this.listenTo(app.localSettings, 'change:shareMetrics', () => this.render());
  }

  className() {
    return 'flexVCent gutterHMd ';
  }

  events() {
    return {
      'click .js-changeSharing': 'onClickChangeSharing',
    };
  }

  onClickChangeSharing() {
    showMetricsModal();
  }

  render() {
    loadTemplate('modals/settings/advanced/metricsStatus.html', (t) => {
      this.$el.html(t({
        shareMetrics: app.localSettings.get('shareMetrics'),
        restartRequired: app.localSettings.get('shareMetricsRestartNeeded'),
      }));
      super.render();
    });

    return this;
  }
}
