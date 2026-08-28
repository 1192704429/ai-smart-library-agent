<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { getAllBorrows, type BorrowRecord } from "@/api/borrow";

defineOptions({ name: "AdminBorrows" });

const loading = ref(false);
const records = ref<BorrowRecord[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 15;
const statusFilter = ref("");

const statusMap: Record<string, { label: string; type: "primary" | "success" | "danger" | "warning" | "info" }> = {
  BORROWED: { label: "借阅中", type: "primary" },
  RETURNED: { label: "已归还", type: "success" },
  OVERDUE: { label: "已逾期", type: "danger" }
};

async function fetchBorrows() {
  loading.value = true;
  try {
    const res = await getAllBorrows({
      page: page.value,
      size: pageSize,
      status: statusFilter.value || undefined
    });
    if (res.code === 200) {
      records.value = res.data.records;
      total.value = res.data.total;
    }
  } catch {
    ElMessage.error("加载借阅记录失败");
  } finally {
    loading.value = false;
  }
}

function onFilterChange() {
  page.value = 1;
  fetchBorrows();
}

onMounted(fetchBorrows);
</script>

<template>
  <div class="sl-page">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">借还审核</h2>
        <p class="sl-page-desc">查看全馆借阅动态，按状态筛选记录。</p>
      </div>
    </div>

    <div class="sl-page-toolbar sl-page-toolbar--split">
      <div class="flex flex-wrap gap-3 items-center">
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          clearable
          style="width: 140px"
          @change="onFilterChange"
        >
          <el-option label="借阅中" value="BORROWED" />
          <el-option label="已归还" value="RETURNED" />
          <el-option label="已逾期" value="OVERDUE" />
        </el-select>
      </div>
      <span class="text-sm text-gray-400">共 {{ total }} 条记录</span>
    </div>

    <div v-loading="loading" class="sl-page-body">
      <div v-if="records.length || loading" class="sl-table-panel">
        <el-table :data="records" stripe class="sl-admin-table w-full">
          <el-table-column label="书名" prop="bookTitle" min-width="180">
            <template #default="{ row }">
              <div class="sl-admin-book-cell">
                <IconifyIconOnline icon="ep:reading" class="sl-admin-book-cell__icon" />
                <router-link :to="`/books/${row.bookId}`" class="sl-link truncate">
                  {{ row.bookTitle }}
                </router-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="借阅用户" prop="username" width="150">
            <template #default="{ row }">
              <div class="sl-admin-user-cell">
                <span class="sl-admin-avatar">{{ row.username?.charAt(0)?.toUpperCase() }}</span>
                <span class="truncate">{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="借阅时间" width="120" align="center">
            <template #default="{ row }">
              <span class="sl-admin-date">{{ dayjs(row.borrowDate).format("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column label="应还日期" width="120" align="center">
            <template #default="{ row }">
              <span
                class="sl-admin-date"
                :class="{ 'is-overdue': row.status === 'OVERDUE' }"
              >
                {{ dayjs(row.dueDate).format("YYYY-MM-DD") }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="归还时间" width="120" align="center">
            <template #default="{ row }">
              <span
                class="sl-admin-date"
                :class="{ 'is-empty': !row.returnDate }"
              >
                {{ row.returnDate ? dayjs(row.returnDate).format("YYYY-MM-DD") : "—" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="statusMap[row.status]?.type" effect="plain" round>
                {{ statusMap[row.status]?.label }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="total > 0" class="sl-pagination sl-pagination--end">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, total"
          background
          @current-change="fetchBorrows"
        />
      </div>
      <div v-else-if="!loading" class="sl-empty-wrap">
        <el-empty description="暂无借阅记录" />
      </div>
    </div>
  </div>
</template>
