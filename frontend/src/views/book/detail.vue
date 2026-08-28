<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import dayjs from "dayjs";
import { getBookDetail, type Book } from "@/api/book";
import { borrowBook } from "@/api/borrow";
import { addFavorite, removeFavorite, checkFavorite } from "@/api/favorite";
import { submitReview, getBookReviews, getAvgRating, type Review } from "@/api/review";

defineOptions({ name: "BookDetail" });

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const book = ref<Book | null>(null);
const favorited = ref(false);
const avgRating = ref(0);
const reviews = ref<Review[]>([]);

// 评论表单
const reviewFormRef = ref<FormInstance>();
const reviewForm = ref({ rating: 5, content: "" });
const submittingReview = ref(false);

async function fetchDetail() {
  loading.value = true;
  const id = Number(route.params.id);
  try {
    const [bookRes, favRes, ratingRes, reviewRes] = await Promise.all([
      getBookDetail(id),
      checkFavorite(id),
      getAvgRating(id),
      getBookReviews(id)
    ]);
    if (bookRes.code === 200) book.value = bookRes.data;
    if (favRes.code === 200) favorited.value = favRes.data.favorited;
    if (ratingRes.code === 200) avgRating.value = ratingRes.data.avgRating;
    if (reviewRes.code === 200) reviews.value = reviewRes.data;
  } catch {
    ElMessage.error("加载图书详情失败");
  } finally {
    loading.value = false;
  }
}

async function onBorrow() {
  if (!book.value) return;
  try {
    const res = await borrowBook(book.value.id);
    if (res.code === 200) {
      ElMessage.success("借阅成功");
      fetchDetail();
    } else {
      ElMessage.error(res.message ?? "借阅失败");
    }
  } catch {
    ElMessage.error("借阅失败");
  }
}

async function toggleFavorite() {
  if (!book.value) return;
  try {
    if (favorited.value) {
      await removeFavorite(book.value.id);
      favorited.value = false;
      ElMessage.success("已取消收藏");
    } else {
      await addFavorite(book.value.id);
      favorited.value = true;
      ElMessage.success("收藏成功");
    }
  } catch {
    ElMessage.error("操作失败");
  }
}

async function onSubmitReview() {
  if (!book.value) return;
  submittingReview.value = true;
  try {
    const res = await submitReview({
      bookId: book.value.id,
      rating: reviewForm.value.rating,
      content: reviewForm.value.content
    });
    if (res.code === 200) {
      ElMessage.success("评论成功");
      reviewForm.value = { rating: 5, content: "" };
      // 刷新评论和评分
      const [ratingRes, reviewRes] = await Promise.all([
        getAvgRating(book.value.id),
        getBookReviews(book.value.id)
      ]);
      if (ratingRes.code === 200) avgRating.value = ratingRes.data.avgRating;
      if (reviewRes.code === 200) reviews.value = reviewRes.data;
    } else {
      ElMessage.error(res.message ?? "评论失败");
    }
  } catch {
    ElMessage.error("评论失败");
  } finally {
    submittingReview.value = false;
  }
}

onMounted(fetchDetail);
</script>

<template>
  <div class="sl-page max-w-4xl mx-auto" v-loading="loading">
    <el-button class="sl-detail-back" plain @click="router.back()">
      <IconifyIconOnline icon="ep:arrow-left" class="mr-1" />返回
    </el-button>

    <div v-if="book">
      <div class="sl-detail-hero">
        <div class="sl-detail-cover">
          <el-image
            :src="book.coverUrl || ''"
            style="width: 200px; height: 280px"
            fit="cover"
            class="cover-detail"
            :preview-src-list="book.coverUrl ? [book.coverUrl] : []"
            :initial-index="0"
            preview-teleported
          >
            <template #error>
              <div class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 rounded-xl">
                <IconifyIconOnline icon="ep:reading" :size="60" />
              </div>
            </template>
          </el-image>
          <div v-if="book.coverUrl" class="text-center text-xs text-gray-400 mt-2">
            <IconifyIconOnline icon="ep:zoom-in" class="mr-0.5" />点击封面预览
          </div>
        </div>

        <div class="sl-detail-info">
          <h1 class="sl-detail-title">{{ book.title }}</h1>
          <div class="sl-detail-author">{{ book.author }}</div>

          <div class="flex items-center gap-2 mb-5">
            <el-rate :model-value="avgRating" disabled show-score />
            <span class="text-sm text-gray-500">（{{ reviews.length }} 条评论）</span>
          </div>

          <el-descriptions :column="2" border class="mb-5">
            <el-descriptions-item label="ISBN">{{ book.isbn }}</el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag type="info" effect="light">{{ book.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="库存">
              <el-tag :type="book.stock > 0 ? 'success' : 'danger'" effect="light">
                {{ book.stock > 0 ? `可借 ${book.stock} 本` : "已借完" }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="总藏书量">{{ book.total }} 本</el-descriptions-item>
            <el-descriptions-item v-if="book.publishedAt" label="出版日期">
              {{ book.publishedAt }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="book.description" class="mb-6">
            <div class="text-sm font-semibold text-gray-600 mb-2">内容简介</div>
            <p class="text-sm text-gray-700 leading-relaxed">{{ book.description }}</p>
          </div>

          <div class="flex gap-3">
            <el-button
              type="primary"
              size="large"
              :disabled="book.stock <= 0"
              @click="onBorrow"
            >
              <IconifyIconOnline icon="ep:reading" class="mr-1" />
              {{ book.stock > 0 ? "借阅此书" : "库存不足" }}
            </el-button>
            <el-button
              :type="favorited ? 'danger' : 'default'"
              size="large"
              plain
              @click="toggleFavorite"
            >
              <IconifyIconOnline :icon="favorited ? 'ep:star-filled' : 'ep:star'" class="mr-1" />
              {{ favorited ? "已收藏" : "收藏" }}
            </el-button>
          </div>
        </div>
      </div>

      <h2 class="sl-section-title">读者评论</h2>

      <el-card class="mb-5" shadow="never">
        <div class="text-sm font-medium mb-3 text-gray-600">发表评论</div>
        <el-form ref="reviewFormRef" :model="reviewForm">
          <el-form-item label="评分">
            <el-rate v-model="reviewForm.rating" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="3"
              placeholder="分享你的阅读感受..."
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submittingReview" @click="onSubmitReview">
              提交评论
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div v-if="reviews.length" class="space-y-3">
        <el-card v-for="r in reviews" :key="r.id" class="sl-review-card" shadow="never">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <el-avatar :size="32">{{ r.username?.charAt(0)?.toUpperCase() }}</el-avatar>
              <span class="font-medium text-sm">{{ r.username }}</span>
            </div>
            <span class="text-xs text-gray-400">{{ dayjs(r.createdAt).format("YYYY-MM-DD HH:mm") }}</span>
          </div>
          <el-rate :model-value="r.rating" disabled size="small" class="mb-2" />
          <p v-if="r.content" class="text-sm text-gray-700">{{ r.content }}</p>
        </el-card>
      </div>
      <el-empty v-else description="暂无评论，快来发表第一条吧" />
    </div>
  </div>
</template>

<style scoped>
.cover-detail {
  cursor: zoom-in;
}
</style>
