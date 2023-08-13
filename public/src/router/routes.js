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
    component: () => import('pages/ErrorNotFound.vue')
  }
];
export default routes;

// const routes = [
//   {
//     path: '/',
//     name: 'Intro',
//     component: () => import('pages/IntroPage.vue')
//   },
//   {
//     path: '/',
//     component: () => import('layouts/MainLayout.vue'),
//     children: [
//       {
//         path: ':category',
//         name: 'Main',
//         component: () => import('pages/TestPage.vue')
//       }
//     ]
//   },
//   {
//     path: '/:catchAll(.*)*',
//     component: () => import('pages/ErrorNotFound.vue')
//   }
// ];
// export default routes;
