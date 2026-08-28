<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { listUsers, updateUserStatus, type UserInfo } from "@/api/user";

defineOptions({ name: "AdminUsers" });

const loading = ref(false);
const users = ref<UserInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 15;
const keyword = ref("");

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await listUsers({ page: page.value, size: pageSize, keyword: keyword.value || undefined });
    if (res.code === 200) {
      users.value = res.data.records;
      total.value = res.data.total;
    }
  } catch {
    ElMessage.error("加载用户列表失败");
  } finally {
    loading.value = false;
  }
}

async function onStatusChange(user: UserInfo, enabled: boolean) {
  try {
    const res = await updateUserStatus(user.id, enabled);
    if (res.code === 200) {
      ElMessage.success(enabled ? "已启用" : "已禁用");
      user.status = enabled ? 1 : 0;
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("操作失败");
  }
}

function onSearch() {
  page.value = 1;
  fetchUsers();
}

onMounted(fetchUsers);
</script>

<template>
  <div class="sl-page">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">账号管理</h2>
        <p class="sl-page-desc">管理读者与管理员账号，控制账号启用状态。</p>
      </div>
    </div>

    <div class="sl-page-toolbar sl-page-toolbar--split">
      <div class="flex flex-wrap gap-3 items-center">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名 / 邮箱"
          clearable
          style="width: 260px"
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <IconifyIconOnline icon="ep:search" />
          </template>
        </el-input>
        <el-button type="primary" plain @click="onSearch">搜索</el-button>
      </div>
      <span class="text-sm text-gray-400">共 {{ total }} 位用户</span>
    </div>

    <div v-loading="loading" class="sl-page-body">
      <div v-if="users.length || loading" class="sl-table-panel">
        <el-table :data="users" stripe class="sl-admin-table w-full">
          <el-table-column label="ID" prop="id" width="90" align="center">
            <template #default="{ row }">
              <span class="sl-admin-id">#{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" prop="username" min-width="160">
            <template #default="{ row }">
              <div class="sl-admin-user-cell">
                <span
                  class="sl-admin-avatar"
                  :class="{ 'sl-admin-avatar--admin': row.role === 'ADMIN' }"
                >
                  {{ row.username?.charAt(0)?.toUpperCase() }}
                </span>
                <span class="font-medium text-[#312e81]">{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="邮箱" prop="email" min-width="220">
            <template #default="{ row }">
              <div class="sl-admin-email">
                <IconifyIconOnline icon="ep:message" class="sl-admin-email__icon" />
                <span class="truncate">{{ row.email || "—" }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="角色" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.role === 'ADMIN' ? 'danger' : 'primary'"
                effect="plain"
                round
              >
                {{ row.role === "ADMIN" ? "管理员" : "读者" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="账号状态" width="140" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.status === 1"
                inline-prompt
                active-text="正常"
                inactive-text="禁用"
                @change="(val: boolean) => onStatusChange(row, val)"
              />
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
          @current-change="fetchUsers"
        />
      </div>
      <div v-else-if="!loading" class="sl-empty-wrap">
        <el-empty description="暂无用户数据" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(html.dark) .font-medium {
  color: #e0e7ff !important;
}
</style>
