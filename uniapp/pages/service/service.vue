<template>
  <view class="container">
    <TnNavbar :fixed="true" :placeholder="true" title="服务中心" bg-color="transparent" :bottom-shadow="false" />
    
    <!-- 顶部Banner -->
    <view class="banner-section">
      <image class="banner-image" src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" mode="aspectFill"></image>
      <view class="banner-content">
        <text class="greeting">您好，需要什么帮助？</text>
        <text class="sub-greeting">24小时管家服务为您守候</text>
      </view>
    </view>

    <!-- Wi-Fi卡片 -->
    <view class="wifi-card">
      <view class="wifi-info">
        <view class="wifi-header">
          <text class="tn-icon-wifi-fill icon"></text>
          <text class="label">Wi-Fi 连接</text>
        </view>
        <view class="wifi-detail">
          <text class="ssid">7Days_Guest</text>
          <text class="password">密码：88888888</text>
        </view>
      </view>
      <view class="wifi-action" @click="handleCopyWifi">
        <text class="action-text">复制密码</text>
      </view>
    </view>
    
    <!-- 快捷服务 -->
    <view class="section-title">快捷服务</view>
    <view class="service-grid">
      <view v-for="(item, index) in serviceList" :key="index" class="service-item" @click="handleServiceClick(item)">
        <view class="icon-wrapper" :class="item.colorClass">
          <text :class="[item.icon, 'service-icon']"></text>
        </view>
        <text class="service-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- 我的服务记录 -->
    <view class="section-title">服务记录</view>
    <view class="request-list">
      <view v-if="activeRequests.length > 0">
        <view v-for="req in activeRequests" :key="req.id" class="request-item">
          <view class="req-header">
            <text class="req-type">{{ req.type }}</text>
            <text class="req-status" :class="req.statusClass">{{ req.status }}</text>
          </view>
          <view class="req-time">{{ req.time }}</view>
          <view class="req-content">{{ req.content }}</view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-text">暂无服务记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import TnNavbar from '@/uni_modules/tuniaoui-vue3/components/navbar/src/navbar.vue'

// 服务列表
const serviceList = ref([
  { name: '客房清扫', icon: 'tn-icon-clean-fill', colorClass: 'blue', type: 'cleaning' },
  { name: '物品借用', icon: 'tn-icon-cube-fill', colorClass: 'orange', type: 'amenities' },
  { name: '叫醒服务', icon: 'tn-icon-alarm-fill', colorClass: 'purple', type: 'wakeup' },
  { name: '设施维修', icon: 'tn-icon-tool-fill', colorClass: 'red', type: 'repair' },
  { name: '送餐服务', icon: 'tn-icon-food-fill', colorClass: 'green', type: 'dining' },
  { name: '联系前台', icon: 'tn-icon-phone-fill', colorClass: 'cyan', type: 'concierge' }
])

// 模拟服务记录
const activeRequests = ref([
  {
    id: 1,
    type: '物品借用',
    status: '处理中',
    statusClass: 'processing',
    time: '10分钟前',
    content: '借用充电器 x 1'
  }
])

const handleServiceClick = (item) => {
  if (item.type === 'concierge') {
    uni.makePhoneCall({
      phoneNumber: '027-12345678'
    })
  } else {
    uni.showToast({
      title: `选择了${item.name}`,
      icon: 'none'
    })
    // 这里可以跳转到具体的服务申请页面
  }
}

const handleCopyWifi = () => {
  uni.setClipboardData({
    data: '88888888',
    success: () => {
      uni.showToast({
        title: '密码已复制',
        icon: 'success'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 20px;
}

.banner-section {
  position: relative;
  width: 100%;
  height: 180px;
  margin-bottom: 20px;
  
  .banner-image {
    width: 100%;
    height: 100%;
  }
  
  .banner-content {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    color: #fff;
    
    .greeting {
      display: block;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .sub-greeting {
      font-size: 14px;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  }
}

.wifi-card {
  margin: -40px 15px 20px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  
  .wifi-info {
    .wifi-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .icon {
        font-size: 20px;
        color: #2979ff;
        margin-right: 8px;
      }
      
      .label {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }
    
    .wifi-detail {
      padding-left: 28px;
      
      .ssid {
        display: block;
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
      }
      
      .password {
        display: block;
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .wifi-action {
    background: #f0f7ff;
    padding: 6px 12px;
    border-radius: 20px;
    
    .action-text {
      color: #2979ff;
      font-size: 12px;
      font-weight: 500;
    }
  }
}

.section-title {
  margin: 20px 15px 15px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 0 15px;
  
  .service-item {
    background: #fff;
    border-radius: 12px;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    
    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
      
      &.blue { background: rgba(41, 121, 255, 0.1); .service-icon { color: #2979ff; } }
      &.orange { background: rgba(255, 145, 0, 0.1); .service-icon { color: #ff9100; } }
      &.purple { background: rgba(123, 31, 162, 0.1); .service-icon { color: #7b1fa2; } }
      &.red { background: rgba(255, 82, 82, 0.1); .service-icon { color: #ff5252; } }
      &.green { background: rgba(67, 160, 71, 0.1); .service-icon { color: #43a047; } }
      &.cyan { background: rgba(0, 184, 212, 0.1); .service-icon { color: #00b8d4; } }
      
      .service-icon {
        font-size: 24px;
      }
    }
    
    .service-name {
      font-size: 14px;
      color: #333;
    }
  }
}

.request-list {
  padding: 0 15px;
  
  .request-item {
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 12px;
    
    .req-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .req-type {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
      
      .req-status {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        
        &.processing {
          background: #e3f2fd;
          color: #2196f3;
        }
      }
    }
    
    .req-time {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
    }
    
    .req-content {
      font-size: 14px;
      color: #666;
      background: #f9f9f9;
      padding: 8px;
      border-radius: 6px;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 30px 0;
    
    .empty-text {
      color: #999;
      font-size: 14px;
    }
  }
}
</style>
