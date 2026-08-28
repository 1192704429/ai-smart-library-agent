<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import { getMyBorrows, returnBook, type BorrowRecord } from "@/api/borrow";

defineOptions({ name: "MyBorrows" });

const loading = ref(false);
const records = ref<BorrowRecord[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 10;

const statusMap: Record<string, { label: string; type: "primary" | "success" | "danger" | "warning" | "info" }> = {
  BORROWED: { label: "借阅中", type: "primary" },
  RETURNED: { label: "已归还", type: "success" },
  OVERDUE: { label: "已逾期", type: "danger" }
};

async function fetchBorrows() {
  loading.value = true;
  try {
    const res = await getMyBorrows({ page: page.value, size: pageSize });
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

async function onReturn(record: BorrowRecord) {
  await ElMessageBox.confirm(`确认归还《${record.bookTitle}》？`, "归还确认", {
    type: "warning"
  });
  try {
    const res = await returnBook(record.id);
    if (res.code === 200) {
      ElMessage.success("归还成功");
      fetchBorrows();
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("归还失败");
  }
}

onMounted(fetchBorrows);
</script>

<template>
  <div class="sl-page">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">借阅记录</h2>
        <p class="sl-page-desc">查看当前借阅状态，支持在线归还操作。</p>
      </div>
    </div>

    <div class="sl-page-toolbar sl-page-toolbar--split">
      <span class="text-sm text-gray-500">我的借阅历史</span>
      <span class="text-sm text-gray-400">共 {{ total }} 条记录</span>
    </div>

    <div v-loading="loading" class="sl-page-body">
      <div v-if="records.length || loading" class="sl-table-panel">
        <el-table :data="records" stripe class="sl-admin-table w-full">
          <el-table-column label="封面" width="96" align="center">
            <template #default="{ row }">
              <div class="sl-table-cover-wrap">
                <el-image
                  :src="row.bookCoverUrl"
                  fit="cover"
                  class="sl-table-cover-img"
                  :preview-src-list="row.bookCoverUrl ? [row.bookCoverUrl] : []"
                  preview-teleported
                >
                  <template #error>
                    <div class="sl-table-cover-placeholder">
                      <IconifyIconOnline icon="ep:reading" />
                    </div>
                  </template>
                </el-image>
              </div>
            </template>
          </el-table-column>
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
          <el-table-column label="作者" prop="bookAuthor" width="120" show-overflow-tooltip />
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
              <span class="sl-admin-date" :class="{ 'is-empty': !row.returnDate }">
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
          <el-table-column label="操作" width="100" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.status !== 'RETURNED'"
                size="small"
                type="primary"
                plain
                round
                @click="onReturn(row)"
              >
                归还
              </el-button>
              <span v-else class="sl-admin-date is-empty">—</span>
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
