// 缩放配置
export const ZOOM_CONFIG = {
  DEFAULT_SCALE: 1,  // 默认缩放比例
  MIN_SCALE: 0.5,   // 最小缩放比例
  MAX_SCALE: 2      // 最大缩放比例
};

// 页面布局配置
export const LAYOUT_CONFIG = {
  LEFT_WIDTH_RATIO: 0.3,  // 左侧宾客列表宽度占比
  RIGHT_WIDTH_RATIO: 0.7  // 右侧桌位布局宽度占比
};

// 内容区域配置
export const CONTENT_CONFIG = {
  DEFAULT_WIDTH: 2000,  // 默认内容区域宽度（像素）
  DEFAULT_HEIGHT: 2000,  // 默认内容区域高度（像素）
  TABLE_SPACING: 150  // 桌子之间的间距（像素）
};

// 桌子和座位配置
export const TABLE_CONFIG = {
  // 桌子配置
  TABLE_SIZE: 100,  // 桌子的直径（rpx）
  TABLE_BACKGROUND: '#FFFFFF',  // 桌子的背景色
  TABLE_BORDER: '#E0E0E0',  // 桌子的边框颜色
  TABLE_SHADOW: '0 4rpx 8rpx rgba(0, 0, 0, 0.1)',  // 桌子的阴影
  
  // 座位配置
  SEAT_SIZE: 40,  // 座位的直径（rpx）
  SEAT_MARGIN: 100,  // 座位距离桌子边缘的距离（rpx）
  SEAT_BACKGROUND: '#E0E0E0',  // 空座位的背景色
  SEAT_OCCUPIED_BACKGROUND: '#007AFF',  // 已占用座位的背景色
  SEAT_TEXT_COLOR: '#333333',  // 座位文字颜色
  SEAT_OCCUPIED_TEXT_COLOR: '#FFFFFF',  // 已占用座位文字颜色
  
  // 容量显示配置
  CAPACITY_FONT_SIZE: 24,  // 容量显示的字体大小（rpx）
  CAPACITY_TEXT_COLOR: '#333333',  // 容量显示的文字颜色
  
  // 动画配置
  TRANSITION_DURATION: '0.3s',  // 过渡动画持续时间
  
  // 删除按钮距离的配置参数
  DELETE_BUTTON_DISTANCE_RATIO: 1.5, // 删除按钮距离是座位距离的倍数
  DEFAULT_CAPACITY: 10,
  MIN_CAPACITY: 4,
  MAX_CAPACITY: 12,
};
