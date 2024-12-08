import { ZOOM_CONFIG, CONTENT_CONFIG, TABLE_CONFIG } from '../../constants/config';

Component({
  properties: {
    tables: {
      type: Array,
      value: []
    },
    selectedGuest: {
      type: Object,
      value: null
    },
    showAddButton: {
      type: Boolean,
      value: true
    }
  },

  data: {
    showModal: false,
    newTableCapacity: 10,
    contentWidth: CONTENT_CONFIG.DEFAULT_WIDTH,
    contentHeight: CONTENT_CONFIG.DEFAULT_HEIGHT,
    scale: ZOOM_CONFIG.DEFAULT_SCALE,
    x: 0,
    y: 0,
    ZOOM_CONFIG,
    TABLE_CONFIG,
    styleVariables: ''
  },

  lifetimes: {
    attached() {
      this.updateCSSVariables();
    }
  },

  methods: {
    updateCSSVariables() {
      const styleVariables = `
        --table-size: ${TABLE_CONFIG.TABLE_SIZE}rpx;
        --table-background: ${TABLE_CONFIG.TABLE_BACKGROUND};
        --table-border: ${TABLE_CONFIG.TABLE_BORDER};
        --table-shadow: ${TABLE_CONFIG.TABLE_SHADOW};
        --seat-size: ${TABLE_CONFIG.SEAT_SIZE}rpx;
        --seat-margin: ${TABLE_CONFIG.SEAT_MARGIN}rpx;
        --seat-background: ${TABLE_CONFIG.SEAT_BACKGROUND};
        --seat-occupied-background: ${TABLE_CONFIG.SEAT_OCCUPIED_BACKGROUND};
        --seat-text-color: ${TABLE_CONFIG.SEAT_TEXT_COLOR};
        --seat-occupied-text-color: ${TABLE_CONFIG.SEAT_OCCUPIED_TEXT_COLOR};
        --transition-duration: 0.3s;
      `;
      this.setData({ styleVariables });
    },

    showAddTable() {
      this.setData({
        showModal: true,
        newTableCapacity: 10
      });
    },

    cancelAdd() {
      this.setData({
        showModal: false
      });
    },

    confirmAdd() {
      const capacity = this.data.newTableCapacity;
      if (!capacity || capacity < 1) {
        wx.showToast({
          title: '请输入有效的座位数量',
          icon: 'none'
        });
        return;
      }

      // 计算新桌子的位置
      const tables = this.data.tables || [];
      const tableSpacing = CONTENT_CONFIG.TABLE_SPACING;
      const tablesPerRow = Math.floor(this.data.contentWidth / tableSpacing);
      
      const currentIndex = tables.length;
      const row = Math.floor(currentIndex / tablesPerRow);
      const col = currentIndex % tablesPerRow;

      const x = col * tableSpacing + tableSpacing / 2;
      const y = row * tableSpacing + tableSpacing / 2;

      // 创建座位数组
      const seats = new Array(capacity).fill(null).map(() => ({
        guestId: null,
        guestName: ''
      }));

      this.triggerEvent('addTable', {
        id: Date.now(),
        capacity,
        x,
        y,
        seats
      });

      this.setData({
        showModal: false
      });
    },

    increaseCapacity() {
      const capacity = this.data.newTableCapacity + 1;
      this.setData({
        newTableCapacity: capacity
      });
    },

    decreaseCapacity() {
      const capacity = Math.max(1, this.data.newTableCapacity - 1);
      this.setData({
        newTableCapacity: capacity
      });
    },

    onSeatTap(e) {
      const { tableId, seatIndex } = e.currentTarget.dataset;
      const selectedGuest = this.data.selectedGuest;
      
      if (!selectedGuest) {
        wx.showToast({
          title: '请先选择来宾',
          icon: 'none'
        });
        return;
      }

      // 获取当前桌子
      const table = this.data.tables.find(t => t.id === tableId);
      if (!table) return;

      // 检查座位是否已被占用
      const seat = table.seats[seatIndex];
      if (seat.guestId) {
        wx.showToast({
          title: '该座位已被占用',
          icon: 'none'
        });
        return;
      }

      this.triggerEvent('assignSeat', {
        tableId,
        seatIndex,
        guestId: selectedGuest.id,
        guestName: selectedGuest.name
      });
    },

    // 处理缩放手势
    onScale(e) {
      console.log('缩放事件:', {
        scale: e.detail.scale,
        currentScale: this.data.scale,
        minScale: this.data.ZOOM_CONFIG.MIN_SCALE,
        maxScale: this.data.ZOOM_CONFIG.MAX_SCALE
      });

      const scale = e.detail.scale;
      if (scale >= this.data.ZOOM_CONFIG.MIN_SCALE && scale <= this.data.ZOOM_CONFIG.MAX_SCALE) {
        this.setData({
          scale: scale
        });
        console.log('缩放已更新:', {
          newScale: scale,
          scaleRange: `${this.data.ZOOM_CONFIG.MIN_SCALE} ~ ${this.data.ZOOM_CONFIG.MAX_SCALE}`
        });
      }
    },

    // 处理拖动事件
    onChange(e) {
      console.log('拖动事件:', {
        x: e.detail.x,
        y: e.detail.y,
        source: e.detail.source,
        contentSize: {
          width: this.data.contentWidth,
          height: this.data.contentHeight
        }
      });

      this.setData({
        x: e.detail.x,
        y: e.detail.y
      });
      console.log('位置已更新:', {
        newX: e.detail.x,
        newY: e.detail.y,
        timestamp: new Date().toISOString()
      });
    }
  }
});
