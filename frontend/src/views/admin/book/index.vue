<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  getBooks, createBook, updateBook, deleteBook, uploadCover,
  type Book, type BookForm
} from "@/api/book";

defineOptions({ name: "AdminBookList" });

const loading = ref(false);
const books = ref<Book[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const formRef = ref<FormInstance>();
const coverUploading = ref(false);

const query = reactive({ page: 1, size: 10, keyword: "" });

const form = reactive<BookForm>({
  title: "", author: "", isbn: "", category: "",
  description: "", coverUrl: "", total: 1, publishedAt: ""
});

const rules: FormRules = {
  title: [{ required: true, message: "请输入书名", trigger: "blur" }],
  author: [{ required: true, message: "请输入作者", trigger: "blur" }],
  isbn: [{ required: true, message: "请输入ISBN", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
  total: [{ required: true, type: "number", min: 1, message: "总量至少为1", trigger: "blur" }]
};

const categories = ["文学", "科幻", "历史", "科技", "经济", "哲学", "艺术", "教育", "其他"];

async function fetchBooks() {
  loading.value = true;
  try {
    const res = await getBooks(query);
    if (res.code === 200) {
      books.value = res.data.records;
      total.value = res.data.total;
    }
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, {
    title: "", author: "", isbn: "", category: "",
    description: "", coverUrl: "", total: 1, publishedAt: ""
  });
  dialogVisible.value = true;
}

function openEdit(row: Book) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    title: row.title, author: row.author, isbn: row.isbn,
    category: row.category, description: row.description ?? "",
    coverUrl: row.coverUrl ?? "", total: row.total,
    publishedAt: row.publishedAt ?? ""
  });
  dialogVisible.value = true;
}

async function onSubmit(formEl: FormInstance | undefined) {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (!valid) return;
    try {
      if (isEdit.value && editId.value) {
        await updateBook(editId.value, form);
        ElMessage.success("更新成功");
      } else {
        await createBook(form);
        ElMessage.success("新增成功");
      }
      dialogVisible.value = false;
      fetchBooks();
    } catch {
      ElMessage.error("操作失败");
    }
  });
}

async function onDelete(row: Book) {
  await ElMessageBox.confirm(`确认删除《${row.title}》？`, "提示", { type: "warning" });
  try {
    await deleteBook(row.id);
    ElMessage.success("删除成功");
    fetchBooks();
  } catch {
    ElMessage.error("删除失败");
  }
}

/** 封面上传：先上传文件获取 URL，再填入表单 */
async function onCoverChange(file: any) {
  coverUploading.value = true;
  try {
    const res = await uploadCover(file.raw);
    if (res.code === 200) {
      form.coverUrl = res.data.url;
      ElMessage.success("封面上传成功");
    }
  } catch {
    ElMessage.error("封面上传失败");
  } finally {
    coverUploading.value = false;
  }
}

onMounted(fetchBooks);
</script>

<template>
  <div class="sl-page">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">书籍列表</h2>
        <p class="sl-page-desc">管理馆藏图书信息，支持新增、编辑与删除。</p>
      </div>
      <div class="sl-page-header__actions">
        <el-button type="primary" @click="openCreate">
          <IconifyIconOnline icon="ep:plus" class="mr-1" />新增图书
        </el-button>
      </div>
    </div>

    <div class="sl-page-toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索书名 / 作者 / ISBN"
        clearable
        style="width: 280px"
        @keyup.enter="fetchBooks"
        @clear="fetchBooks"
      >
        <template #prefix>
          <IconifyIconOnline icon="ep:search" />
        </template>
      </el-input>
      <el-button type="primary" plain @click="fetchBooks">搜索</el-button>
      <span class="text-sm text-gray-400 ml-auto">共 {{ total }} 本</span>
    </div>

    <div class="sl-page-body">
      <div class="sl-table-panel">
        <el-table
          v-loading="loading"
          :data="books"
          stripe
          class="sl-admin-table admin-book-table"
        >
          <el-table-column label="封面" width="108" align="center">
            <template #default="{ row }">
              <div class="admin-book-cover-wrap">
                <el-image
                  :src="row.coverUrl"
                  fit="cover"
                  class="admin-book-cover-img"
                  :preview-src-list="row.coverUrl ? [row.coverUrl] : []"
                  preview-teleported
                >
                  <template #error>
                    <div class="admin-book-cover-placeholder">
                      <IconifyIconOnline icon="ep:picture" />
                      <span>暂无封面</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="书名" min-width="160" show-overflow-tooltip />
          <el-table-column prop="author" label="作者" width="120" show-overflow-tooltip />
          <el-table-column prop="isbn" label="ISBN" width="140" />
          <el-table-column prop="category" label="分类" width="90">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="70" align="center">
            <template #default="{ row }">
              <el-tag :type="row.stock > 0 ? 'success' : 'danger'" size="small">{{ row.stock }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="total" label="总量" width="70" align="center" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="total > 0" class="sl-pagination sl-pagination--end">
        <el-pagination
          v-model:current-page="query.page"
          :page-size="query.size"
          :total="total"
          layout="prev, pager, next, total"
          background
          @current-change="fetchBooks"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑图书' : '新增图书'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="书名" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="form.isbn" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width:100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="总藏书量" prop="total">
          <el-input-number v-model="form.total" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="出版日期">
          <el-date-picker
            v-model="form.publishedAt"
            type="date"
            value-format="YYYY-MM-DD"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="封面图片">
          <div class="flex items-center gap-3">
            <el-upload
              :show-file-list="false"
              accept="image/jpeg,image/png,image/webp"
              :before-upload="() => false"
              :on-change="onCoverChange"
            >
              <el-button size="small" :loading="coverUploading">
                <IconifyIconOnline icon="ep:upload" class="mr-1" />上传封面
              </el-button>
            </el-upload>
            <el-image
              v-if="form.coverUrl"
              :src="form.coverUrl"
              style="width:50px;height:65px"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit(formRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-book-table :deep(.el-table__cell) {
  padding-top: 14px;
  padding-bottom: 14px;
}

.admin-book-cover-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
}

.admin-book-cover-img {
  width: 72px;
  height: 96px;
  overflow: hidden;
  cursor: zoom-in;
  border-radius: 8px;
  box-shadow:
    0 2px 10px rgb(30 27 68 / 12%),
    0 0 0 1px rgb(99 102 241 / 8%);
}

.admin-book-cover-placeholder {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 96px;
  font-size: 11px;
  color: #9ca3af;
  background: linear-gradient(145deg, rgb(99 102 241 / 6%), rgb(129 140 248 / 3%));
  border: 1px dashed rgb(99 102 241 / 18%);
  border-radius: 8px;
}

.admin-book-cover-placeholder :deep(svg) {
  font-size: 22px;
  color: #c7d2fe;
}
</style>
