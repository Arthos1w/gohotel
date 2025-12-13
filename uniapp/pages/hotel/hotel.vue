<template>
  <view class="container">
    <TnNavbar :fixed="true" :placeholder="true" title="客房列表" bg-color="transparent" :bottom-shadow="false" />
    
    <view class="room-list">
      <view v-for="(room, index) in roomList" :key="index" class="room-card" @click="handleRoomClick(room)">
        <!-- 图片区域 -->
        <view class="image-wrapper">
          <image :src="room.image" mode="aspectFill" class="room-image"></image>
          <view class="image-mask"></view>
          <text class="room-name">{{ room.name }}</text>
        </view>
        
        <!-- 内容区域 -->
        <view class="content-wrapper">
          <!-- 描述/地址行 -->
          <view class="info-row location">
            <text class="tn-icon-location-fill icon"></text>
            <text class="text">{{ room.desc }}</text>
          </view>
          
          <!-- 评分/标签行 -->
          <view class="info-row scores">
            <text class="score">{{ room.score }}分</text>
            <text class="sub-text">{{ room.consumption }}消费</text>
            <text class="sub-text">{{ room.comments }}评论</text>
          </view>
          
          <!-- 价格行 -->
          <view class="price-row">
            <text class="currency">¥</text>
            <text class="amount">{{ room.price }}</text>
            <text class="suffix">起</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import TnNavbar from '@/uni_modules/tuniaoui-vue3/components/navbar/src/navbar.vue'

const roomList = ref([
  {
    id: 1,
    name: '豪华大床房',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    desc: '30m² | 大床 | 有窗 | 含早',
    score: 5.0,
    consumption: '500+',
    comments: 128,
    price: 299
  },
  {
    id: 2,
    name: '行政套房',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    desc: '45m² | 特大床 | 全景落地窗 | 行政酒廊',
    score: 5.0,
    consumption: '200+',
    comments: 56,
    price: 599
  },
  {
    id: 3,
    name: '标准双床房',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    desc: '28m² | 双床 | 内窗 | 无早',
    score: 4.8,
    consumption: '1000+',
    comments: 342,
    price: 199
  }
])

const handleRoomClick = (room) => {
  // 跳转到房间详情页
  uni.navigateTo({
    url: `/pages/room-detail/room-detail?id=${room.id}`
  })
}
</script>

<style lang="scss" scoped>
// 文本省略混入
@mixin text-ellipsis-1 {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 20px;
}

.room-list {
  padding: 15px;
}

.room-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  
  .image-wrapper {
    position: relative;
    width: 100%;
    height: 200px;
    
    .room-image {
      width: 100%;
      height: 100%;
    }
    
    .image-mask {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60%;
      background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
      z-index: 1;
    }
    
    .room-name {
      position: absolute;
      bottom: 12px;
      left: 15px;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      z-index: 2;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  }
  
  .content-wrapper {
    padding: 15px;
    position: relative;
    
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      &.location {
        color: #666;
        font-size: 14px;
        
        .icon {
          font-size: 16px;
          margin-right: 4px;
        }
        
        .text {
          @include text-ellipsis-1;
        }
      }
      
      &.scores {
        .score {
          color: #2979ff;
          font-weight: 600;
          font-size: 16px;
          margin-right: 10px;
        }
        
        .sub-text {
          color: #999;
          font-size: 13px;
          margin-right: 10px;
        }
      }
    }
    
    .price-row {
      position: absolute;
      right: 15px;
      bottom: 15px;
      display: flex;
      align-items: baseline;
      
      .currency {
        color: #C8A882;
        font-size: 14px;
        margin-right: 2px;
      }
      
      .amount {
        color: #C8A882;
        font-size: 24px;
        font-weight: 600;
      }
      
      .suffix {
        color: #999;
        font-size: 12px;
        margin-left: 2px;
      }
    }
  }
}
</style>
