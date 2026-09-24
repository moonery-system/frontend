import { ref } from "vue";
import type { Ref } from "vue";
import api from "@/services/api";

interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface Links {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
  links: Links;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  client_address: any[];
}

export function usePaginatedFetch<T>(endpoint: string) {
  const data: Ref<T[]> = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const lastPage = ref(1);
  const perPage = ref(10);
  const loading = ref(false);

  async function fetch(page = 1, params: Record<string, any> = {}) {
    loading.value = true;
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<T>>>(
        endpoint,
        {
          params: { ...params, page, per_page: perPage.value },
        }
      );
      data.value = response.data.data.data;
      const meta = response.data.data.meta;
      total.value = meta.total;
      currentPage.value = meta.current_page;
      lastPage.value = meta.last_page;
    } finally {
      loading.value = false;
    }
  }

  function goToPage(page: number, params: Record<string, any> = {}) {
    if (page >= 1 && page <= lastPage.value) {
      currentPage.value = page;
      return fetch(page, params);
    }
  }

  return {
    data,
    total,
    currentPage,
    lastPage,
    perPage,
    loading,
    fetch,
    goToPage,
  };
}
