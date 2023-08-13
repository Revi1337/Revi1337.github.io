import { LoadingBar } from 'quasar';
import { boot } from 'quasar/wrappers';

export default boot(async () => {
  LoadingBar.setDefaults({
    color: 'white',
    size: '2px',
    position: 'top'
  });
});
