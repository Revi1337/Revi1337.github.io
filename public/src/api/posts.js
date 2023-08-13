import axios from 'axios';
import { useAuthStore } from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';

const { accessToken } = storeToRefs(useAuthStore());

export function findById(id) {
  return axios.get(`/api/post/${id}`);
}

export function createPost(jsonData) {
  return axios.post(
    '/api/posts',
    {
      ...jsonData
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    }
  );
}

// post
export function findPostByCategory(category) {
  return axios.get(`/api/posts`, {
    params: {
      category: category
    }
  });
}

export function findAllPost(params) {
  return axios.get('/api/posts', { params });
}

export function findPostByContainingString(params) {
  return axios.get(`/api/posts`, { params });
}

export function findPostById(id) {
  return axios.get(`/api/post/${id}`);
}
