const routes = [
  {
    path: '/',
    name: 'Intro',
    component: () => import('pages/IntroPage.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('pages/IndexPage.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    name: 'NotFound',
    component: () => import('pages/ErrorNotFound.vue')
  }
];
export default routes;
