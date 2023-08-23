import { boot } from 'quasar/wrappers';
import VueCalendarHeatmap from 'vue3-calendar-heatmap';

export default boot(({ app }) => {
  app.use(VueCalendarHeatmap);
});
