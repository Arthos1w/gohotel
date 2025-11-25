<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left">
          <text class="location-icon">📍</text>
          <text class="hotel-name">七天酒店</text>
        </view>
        <view class="navbar-right">
          <view class="icon-btn more-icon">
            <text class="icon-text">⋯</text>
          </view>
          <view class="icon-btn target-icon">
            <text class="icon-text">🎯</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主内容区域 -->
    <scroll-view class="main-content" :style="{ paddingTop: navbarHeight + 'px' }" scroll-y>
      <!-- 酒店图片轮播 -->
      <view class="hotel-banner">
        <swiper 
          class="swiper" 
          :indicator-dots="true" 
          :autoplay="true" 
          :circular="true"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#C8A882"
        >
          <swiper-item v-for="(img, index) in hotelImages" :key="index">
            <image class="banner-img" :src="img" mode="aspectFill"></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- 酒店地址 -->
      <view class="address-section">
        <text class="address-icon">📍</text>
        <text class="address-text">{{ address }}</text>
      </view>

      <!-- 预订信息 -->
      <view class="booking-info">
        <view class="date-item" @click="selectDate('checkIn')">
          <text class="date-label">今天入住</text>
          <text class="date-value">{{ checkInDate }}</text>
        </view>
        <view class="nights-info">
          <view class="nights-box">
            <text class="nights-text">共{{ nights }}晚</text>
          </view>
        </view>
        <view class="date-item" @click="selectDate('checkOut')">
          <text class="date-label">周三离店</text>
          <text class="date-value">{{ checkOutDate }}</text>
        </view>
      </view>

      <!-- 搜索框 -->
      <view class="search-section">
        <view class="search-input" @click="goToSearch">
          <text class="search-icon">🔍</text>
          <text class="search-placeholder">输入关键词搜索酒店</text>
        </view>
      </view>

      <!-- 立即预订按钮 -->
      <view class="booking-btn-wrapper">
        <button class="booking-btn" @click="handleBooking" hover-class="booking-btn-hover">
          立即预定
        </button>
        <text class="guarantee-text">官方渠道预订享低价保证</text>
      </view>

      <!-- 功能入口 -->
      <view class="feature-section">
        <view class="feature-item" @click="navigateTo('cinema')" hover-class="feature-item-hover">
          <view class="feature-icon-box cinema">
            <text class="feature-icon-text">🎬</text>
          </view>
          <view class="feature-info">
            <text class="feature-title">影院足道</text>
            <text class="feature-subtitle">官方自营 ></text>
          </view>
        </view>
        <view class="feature-item" @click="navigateTo('points')" hover-class="feature-item-hover">
          <view class="feature-icon-box points">
            <text class="feature-icon-text">🎁</text>
          </view>
          <view class="feature-info">
            <text class="feature-title">积分商城</text>
            <text class="feature-subtitle">体验兑换 ></text>
          </view>
        </view>
        <view class="feature-item" @click="navigateTo('vip')" hover-class="feature-item-hover">
          <view class="feature-icon-box vip">
            <text class="feature-icon-text">👑</text>
          </view>
          <view class="feature-info">
            <text class="feature-title">升级会员</text>
            <text class="feature-subtitle">更多折扣 ></text>
          </view>
        </view>
      </view>

      <!-- 促销横幅 -->
      <view class="promotion-banner" @click="goToPromotion">
        <image class="promotion-img" :src="promotionImage" mode="aspectFill"></image>
      </view>
      
      <!-- 底部占位，避免被tabbar遮挡 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { hotel, booking } from '@/api/index.js'

// 状态栏高度
const statusBarHeight = ref(0)
const navbarHeight = ref(44)

// 酒店信息
const hotelId = ref(1) // 默认酒店ID，可以从路由参数获取
const hotelData = ref(null)
const hotelImages = ref([
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
])
const promotionImage = ref('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80')
const address = ref('湖北省武汉市硚口区晴川街道沿河大道246号')
const checkInDate = ref('05月14日')
const checkOutDate = ref('05月15日')
const nights = ref(1)
const loading = ref(false)

onLoad((options) => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  navbarHeight.value = statusBarHeight.value + 44
  
  // 如果有传入酒店ID
  if (options?.hotelId) {
    hotelId.value = options.hotelId
  }
  
  // 加载酒店数据
  loadHotelData()
})

// 加载酒店详情
const loadHotelData = async () => {
  try {
    loading.value = true
    const data = await hotel.getHotelDetail(hotelId.value)
    hotelData.value = data
    
    // 更新页面数据
    if (data.images && data.images.length > 0) {
      hotelImages.value = data.images
    }
    if (data.address) {
      address.value = data.address
    }
  } catch (error) {
    console.error('加载酒店数据失败:', error)
    // 使用默认数据
  } finally {
    loading.value = false
  }
}

// 选择日期
const selectDate = (type) => {
  uni.showToast({
    title: type === 'checkIn' ? '选择入住日期' : '选择离店日期',
    icon: 'none'
  })
  // TODO: 实现日期选择器
}

// 搜索
const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/search/search'
  })
}

// 处理预订
const handleBooking = async () => {
  // 检查是否登录
  const token = uni.getStorageSync('gohotel_token')
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    })
    return
  }
  
  // 计算价格
  try {
    uni.showLoading({ title: '计算价格中...' })
    
    const priceData = await booking.calculatePrice({
      hotelId: hotelId.value,
      roomTypeId: 1, // 这里应该让用户选择房型
      checkInDate: checkInDate.value,
      checkOutDate: checkOutDate.value,
      roomCount: 1
    })
    
    uni.hideLoading()
    
    // 显示价格确认
    uni.showModal({
      title: '预订确认',
      content: `入住日期：${checkInDate.value}\n离店日期：${checkOutDate.value}\n总价：¥${priceData.totalPrice}`,
      confirmText: '确认预订',
      success: async (res) => {
        if (res.confirm) {
          await createBookingOrder()
        }
      }
    })
  } catch (error) {
    uni.hideLoading()
    console.error('计算价格失败:', error)
  }
}

// 创建预订订单
const createBookingOrder = async () => {
  try {
    uni.showLoading({ title: '创建订单中...' })
    
    const orderData = await booking.createBooking({
      hotelId: hotelId.value,
      roomTypeId: 1,
      checkInDate: checkInDate.value,
      checkOutDate: checkOutDate.value,
      roomCount: 1,
      guestName: '张三', // 应该从用户信息获取或让用户填写
      guestPhone: '13800138000'
    })
    
    uni.hideLoading()
    
    uni.showToast({
      title: '预订成功',
      icon: 'success'
    })
    
    // 跳转到订单详情
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderData.id}`
      })
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    console.error('创建订单失败:', error)
  }
}

// 导航到其他页面
const navigateTo = (type) => {
  const routes = {
    cinema: '/pages/cinema/cinema',
    points: '/pages/points/points',
    vip: '/pages/vip/vip'
  }
  
  if (routes[type]) {
    uni.navigateTo({
      url: routes[type]
    })
  }
}

// 查看促销详情
const goToPromotion = () => {
  uni.navigateTo({
    url: '/pages/promotion/promotion'
  })
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f8f8f8;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
    
    .location-icon {
      font-size: 20px;
      margin-right: 6px;
    }
    
    .hotel-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .icon-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s;
      
      .icon-text {
        font-size: 20px;
      }
    }
    
    .more-icon {
      background-color: #f5f5f5;
    }
    
    .target-icon {
      background-color: #333;
      
      .icon-text {
        filter: brightness(0) invert(1);
      }
    }
  }
}

/* 主内容 */
.main-content {
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
}

/* 酒店横幅 */
.hotel-banner {
  width: 100%;
  background-color: #fff;
  
  .swiper {
    width: 100%;
    height: 480rpx;
    
    .banner-img {
      width: 100%;
      height: 100%;
    }
  }
}

/* 地址部分 */
.address-section {
  display: flex;
  align-items: center;
  padding: 32rpx 40rpx;
  background-color: #fff;
  
  .address-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
  }
  
  .address-text {
    flex: 1;
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    line-height: 1.4;
  }
}

/* 预订信息 */
.booking-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx;
  background-color: #fff;
  margin-top: 20rpx;
  
  .date-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .date-label {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 12rpx;
    }
    
    .date-value {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
    }
  }
  
  .nights-info {
    padding: 0 40rpx;
    
    .nights-box {
      padding: 12rpx 24rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      
      .nights-text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

/* 搜索框 */
.search-section {
  padding: 32rpx 40rpx;
  background-color: #fff;
  margin-top: 20rpx;
  
  .search-input {
    height: 88rpx;
    background-color: #f5f5f5;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    
    .search-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .search-placeholder {
      font-size: 28rpx;
      color: #ccc;
    }
  }
}

/* 预订按钮 */
.booking-btn-wrapper {
  padding: 48rpx 40rpx 32rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .booking-btn {
    width: 100%;
    height: 100rpx;
    background: linear-gradient(135deg, #C8A882 0%, #B89968 100%);
    border-radius: 16rpx;
    color: #fff;
    font-size: 34rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(200, 168, 130, 0.3);
    
    &::after {
      border: none;
    }
  }
  
  .booking-btn-hover {
    opacity: 0.9;
    transform: scale(0.98);
  }
  
  .guarantee-text {
    margin-top: 24rpx;
    font-size: 24rpx;
    color: #999;
  }
}

/* 功能入口 */
.feature-section {
  display: flex;
  justify-content: space-around;
  padding: 40rpx 20rpx;
  background-color: #fff;
  margin-top: 20rpx;
  
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s;
    
    .feature-icon-box {
      width: 88rpx;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      
      &.cinema {
        background: linear-gradient(135deg, #FFE5E5 0%, #FFD4D4 100%);
      }
      
      &.points {
        background: linear-gradient(135deg, #E5F3FF 0%, #D4E8FF 100%);
      }
      
      &.vip {
        background: linear-gradient(135deg, #FFF4E5 0%, #FFE9D4 100%);
      }
      
      .feature-icon-text {
        font-size: 48rpx;
      }
    }
    
    .feature-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .feature-title {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
        margin-bottom: 8rpx;
      }
      
      .feature-subtitle {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .feature-item-hover {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

/* 促销横幅 */
.promotion-banner {
  margin: 32rpx 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  
  .promotion-img {
    width: 100%;
    height: 320rpx;
  }
}

/* 底部占位 */
.bottom-placeholder {
  height: 40rpx;
}
</style>

