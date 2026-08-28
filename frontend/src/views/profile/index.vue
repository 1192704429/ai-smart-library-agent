<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { changePasswordApi } from "@/api/auth";

defineOptions({ name: "Profile" });

const userStore = useUserStoreHook();
const pwdFormRef = ref<FormInstance>();
const loading = ref(false);

const pwdForm = reactive({ oldPassword: "", newPassword: "", confirmPassword: "" });

const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value !== pwdForm.newPassword) callback(new Error("两次密码不一致"));
        else callback();
      },
      trigger: "blur"
    }
  ]
};

onMounted(() => userStore.fetchUserInfo());

async function onChangePassword(formEl: FormInstance | undefined) {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      const res: any = await changePasswordApi({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      });
      if (res.code === 200) {
        ElMessage.success("密码修改成功，请重新登录");
        formEl.resetFields();
        setTimeout(() => userStore.logOut(), 1500);
      } else {
        ElMessage.error(res.message ?? "修改失败");
      }
    } catch {
      ElMessage.error("修改失败");
    } finally {
      loading.value = false;
    }
  });
}
</script>

<template>
  <div class="sl-page max-w-2xl mx-auto">
    <div class="sl-page-header">
      <div class="sl-page-header__main">
        <h2 class="sl-page-title">我的主页</h2>
        <p class="sl-page-desc">查看账号信息，修改登录密码。</p>
      </div>
    </div>

    <div class="sl-profile-hero">
      <el-avatar :size="72" :src="userStore.avatar">
        {{ userStore.username?.charAt(0)?.toUpperCase() }}
      </el-avatar>
      <div>
        <div class="sl-profile-name">{{ userStore.username }}</div>
        <el-tag :type="userStore.role === 'ADMIN' ? 'danger' : 'primary'" class="mt-2" effect="light">
          {{ userStore.role === "ADMIN" ? "管理员" : "读者" }}
        </el-tag>
      </div>
    </div>

    <el-card header="修改密码" shadow="never">
      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="90px"
        style="max-width: 400px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onChangePassword(pwdFormRef)">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
