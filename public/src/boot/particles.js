import Particles from 'vue3-particles';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.use(Particles);
});
