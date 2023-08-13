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
        path: ':category',
        name: 'Main',
        component: () => import('pages/TestPage.vue')
      }
      // {
      //   path: ':category',
      //   name: 'Post',
      //   component: () => import('pages/PostCategoryPage.vue')
      // }
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
//         path: 'index',
//         name: 'Index',
//         component: () => import('pages/IndexPage.vue')
//       },
//       {
//         path: 'post',
//         name: 'Post',
//         children: [
//           {
//             path: '',
//             name: 'PostDefault',
//             beforeEnter: () => {
//               return { name: 'CategoryPost', params: { category: 'dev' } };
//             }
//           },
//           {
//             path: ':category',
//             name: 'CategoryPost',
//             props: true,
//             beforeEnter: ({ params }) => {
//               if (
//                 params.length === 0 ||
//                 !['dev', 'ctf', 'writeup', 'cs', 'cheetsheet'].includes(params.category)
//               )
//                 return { name: 'CategoryPost', params: { category: 'dev' } };
//             },
//             component: () => import('pages/PostCategoryPage.vue')
//           }
//         ]
//       },
//       {
//         path: 'posts/:id',
//         name: 'PostDetails',
//         props: true,
//         meta: {
//           layoutPadding: 470
//         },
//         component: () => import('pages/post/PostDetails.vue')
//       }
//     ]
//   },
//   {
//     path: '/:catchAll(.*)*',
//     component: () => import('pages/ErrorNotFound.vue')
//   }
// ];
// export default routes;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
//         path: 'index',
//         name: 'Index',
//         component: () => import('pages/IndexPage.vue')
//       },
//       {
//         path: 'post',
//         name: 'Post',
//         children: [
//           {
//             path: '',
//             name: 'PostDefault',
//             beforeEnter: () => {
//               return { name: 'CategoryPost', params: { category: 'dev' } };
//             }
//           },
//           {
//             path: 'create',
//             name: 'CreatePost',
//             meta: {
//               layoutPadding: 20,
//               authorization: ['ADMIN']
//             },
//             component: () => import('pages/post/CreatePostPage.vue')
//           },
//           {
//             path: ':category',
//             name: 'CategoryPost',
//             props: true,
//             beforeEnter: ({ params }) => {
//               if (
//                 params.length === 0 ||
//                 !['dev', 'ctf', 'writeup', 'cs', 'cheetsheet'].includes(params.category)
//               )
//                 return { name: 'CategoryPost', params: { category: 'dev' } };
//             },
//             component: () => import('pages/PostCategoryPage.vue')
//           }
//         ]
//       },
//       {
//         path: 'posts/:id',
//         name: 'PostDetails',
//         props: true,
//         meta: {
//           layoutPadding: 470
//         },
//         component: () => import('pages/post/PostDetails.vue')
//       }
//     ]
//   },
//   {
//     path: '/:catchAll(.*)*',
//     component: () => import('pages/ErrorNotFound.vue')
//   }
// ];
// export default routes;
