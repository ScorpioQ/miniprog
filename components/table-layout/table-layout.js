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
    styleVariables: '',
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    lastScale: 1,
    currentScale: 1,
    seatPositions: [], // 新增：存储座位位置
    deleteButtonPositions: [], // 新增：存储删除按钮位置
  },

  lifetimes: {
    created() {
      console.log('[TableLayout] 组件创建:', {
        timestamp: Date.now(),
        ZOOM_CONFIG: this.data.ZOOM_CONFIG,
        TABLE_CONFIG: this.data.TABLE_CONFIG
      });
    },

    attached() {
      console.log('[TableLayout] 组件挂载:', {
        timestamp: Date.now(),
        data: this.data
      });
      this.updateCSSVariables();
      
      // 获取组件尺寸信息
      const query = this.createSelectorQuery();
      query.select('.table-layout').boundingClientRect(rect => {
        console.log('[TableLayout] 容器尺寸:', {
          timestamp: Date.now(),
          rect
        });
      }).exec();
    },

    detached() {
      console.log('[TableLayout] 组件卸载:', {
        timestamp: Date.now()
      });
    }
  },

  observers: {
    'scale': function(scale) {
      console.log('[TableLayout] Scale 变化:', {
        timestamp: Date.now(),
        newScale: scale,
        oldScale: this.data.scale
      });
      this.setData({
        styleVariables: `--current-scale: ${scale};`
      });
    },
    'tables': function(tables) {
      if (tables && tables.length > 0) {
        this.updatePositions();
      }
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
      console.log('[TableLayout] 更新样式变量:', {
        timestamp: Date.now(),
        styleVariables
      });
      this.setData({ styleVariables });
    },

    showAddTable() {
      console.log('[TableLayout] 显示添加桌子弹窗:', {
        timestamp: Date.now()
      });
      this.setData({
        showModal: true,
        newTableCapacity: 10
      });
    },

    cancelAdd() {
      console.log('[TableLayout] 取消添加桌子:', {
        timestamp: Date.now()
      });
      this.setData({
        showModal: false
      });
    },

    confirmAdd() {
      console.log('[TableLayout] 确认添加桌子:', {
        timestamp: Date.now()
      });
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

      // 添加一些偏移量，确保第一个桌子不会太靠边
      const offsetX = tableSpacing;
      const offsetY = tableSpacing;

      const x = col * tableSpacing + offsetX;
      const y = row * tableSpacing + offsetY;

      console.log('添加新餐桌:', {
        index: currentIndex,
        position: { x, y },
        spacing: tableSpacing,
        grid: { row, col },
        contentSize: { width: this.data.contentWidth, height: this.data.contentHeight }
      });

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
      console.log('[TableLayout] 增加座位数量:', {
        timestamp: Date.now()
      });
      const capacity = this.data.newTableCapacity + 1;
      this.setData({
        newTableCapacity: capacity
      });
    },

    decreaseCapacity() {
      console.log('[TableLayout] 减少座位数量:', {
        timestamp: Date.now()
      });
      const capacity = Math.max(1, this.data.newTableCapacity - 1);
      this.setData({
        newTableCapacity: capacity
      });
    },

    onSeatTap(e) {
      console.log('[TableLayout] 点击座位:', {
        timestamp: Date.now(),
        detail: e.detail
      });
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

    onDeleteGuest(e) {
      const { tableId, seatIndex } = e.currentTarget.dataset;
      console.log('Delete guest clicked:', { tableId, seatIndex });
      
      // 找到对应的桌子
      const tableIndex = this.data.tables.findIndex(t => t.id === tableId);
      if (tableIndex === -1) {
        console.error('Table not found:', tableId);
        return;
      }
      
      const table = this.data.tables[tableIndex];
      const seat = table.seats[seatIndex];
      if (!seat || !seat.guestId) {
        console.error('Seat or guest not found:', { seatIndex, seat });
        return;
      }

      // 获取要删除的宾客信息
      const guestId = seat.guestId;
      const guestName = seat.guestName;
      
      // 清空座位信息
      const newTables = [...this.data.tables];
      newTables[tableIndex] = {
        ...table,
        seats: table.seats.map((s, idx) => 
          idx === seatIndex ? { ...s, guestId: '', guestName: '' } : s
        )
      };
      
      console.log('Updating tables:', newTables[tableIndex].seats[seatIndex]);
      
      this.setData({ 
        tables: newTables 
      }, () => {
        // 触发事件通知父组件更新宾客列表
        this.triggerEvent('guestRemoved', {
          guestId,
          guestName,
          tableId,
          seatIndex
        });
        
        console.log('Guest removed successfully:', {
          guestId,
          guestName,
          tableId,
          seatIndex
        });
      });
    },

    // 处理缩放手势
    onScale(e) {
      console.log('[TableLayout] 缩放开始:', {
        timestamp: Date.now(),
        detail: e.detail,
        currentState: {
          scale: this.data.scale,
          x: this.data.x,
          y: this.data.y
        }
      });

      const scale = e.detail.scale;
      if (scale >= this.data.ZOOM_CONFIG.MIN_SCALE && scale <= this.data.ZOOM_CONFIG.MAX_SCALE) {
        console.log('[TableLayout] 缩放有效:', {
          timestamp: Date.now(),
          scale,
          bounds: {
            min: this.data.ZOOM_CONFIG.MIN_SCALE,
            max: this.data.ZOOM_CONFIG.MAX_SCALE
          }
        });

        this.setData({
          scale: scale,
          styleVariables: `--current-scale: ${scale};`
        }, () => {
          console.log('[TableLayout] 缩放完成:', {
            timestamp: Date.now(),
            newScale: this.data.scale,
            styleVariables: this.data.styleVariables
          });
        });
      } else {
        console.log('[TableLayout] 缩放超出范围:', {
          timestamp: Date.now(),
          scale,
          bounds: {
            min: this.data.ZOOM_CONFIG.MIN_SCALE,
            max: this.data.ZOOM_CONFIG.MAX_SCALE
          }
        });
      }
    },

    // 处理拖动事件
    onChange(e) {
      console.log('[TableLayout] 拖动开始:', {
        timestamp: Date.now(),
        detail: e.detail,
        currentState: {
          x: this.data.x,
          y: this.data.y,
          scale: this.data.scale
        },
        contentSize: {
          width: this.data.contentWidth,
          height: this.data.contentHeight
        }
      });

      const { x, y } = e.detail;
      this.setData({
        x: x,
        y: y
      }, () => {
        console.log('[TableLayout] 拖动完成:', {
          timestamp: Date.now(),
          newPosition: { x: this.data.x, y: this.data.y }
        });
      });
    },

    onTouchStart(e) {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.setData({
          startX: touch.clientX - this.data.currentX,
          startY: touch.clientY - this.data.currentY,
        });
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // 记录两个触摸点的初始位置
        this.touch1StartX = touch1.clientX;
        this.touch1StartY = touch1.clientY;
        this.touch2StartX = touch2.clientX;
        this.touch2StartY = touch2.clientY;
        
        // 记录开始时的缩放值和位置
        this.startScale = this.data.currentScale;
        this.startPosX = this.data.currentX;
        this.startPosY = this.data.currentY;
        
        // 计算初始触摸点之间的距离
        this.startDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // 计算初始中心点
        this.startMidX = (touch1.clientX + touch2.clientX) / 2;
        this.startMidY = (touch1.clientY + touch2.clientY) / 2;
      }
      console.log('Touch start:', e.touches.length, 'fingers');
    },

    onTouchMove(e) {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const newX = touch.clientX - this.data.startX;
        const newY = touch.clientY - this.data.startY;
        
        this.setData({
          currentX: newX,
          currentY: newY,
        });
      } else if (e.touches.length === 2 && this.startDistance) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // 计算当前两点之间的距离
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // 计算新的缩放比例
        const newScale = Math.min(
          Math.max(
            this.startScale * (currentDistance / this.startDistance),
            this.data.ZOOM_CONFIG.MIN_SCALE
          ),
          this.data.ZOOM_CONFIG.MAX_SCALE
        );
        
        // 计算当前的中心点
        const currentMidX = (touch1.clientX + touch2.clientX) / 2;
        const currentMidY = (touch1.clientY + touch2.clientY) / 2;
        
        // 计算缩放前后的位置差异
        const scaleRatio = newScale / this.startScale;
        
        // 计算新的位置，保持手指触摸点相对位置不变
        const newX = this.startPosX - (this.startMidX - this.startPosX) * (scaleRatio - 1) + (currentMidX - this.startMidX);
        const newY = this.startPosY - (this.startMidY - this.startPosY) * (scaleRatio - 1) + (currentMidY - this.startMidY);
        
        this.setData({
          currentScale: newScale,
          currentX: newX,
          currentY: newY,
        });
        
        console.log('Scale and position updated:', {
          scale: newScale,
          x: newX,
          y: newY
        });
      }
    },

    onTouchEnd(e) {
      // 重置所有临时变量
      this.startDistance = null;
      this.startMidX = null;
      this.startMidY = null;
      this.touch1StartX = null;
      this.touch1StartY = null;
      this.touch2StartX = null;
      this.touch2StartY = null;
      console.log('Touch end');
    },

    // 计算位置的工具函数
    calculatePositions(capacity) {
      const seatMargin = TABLE_CONFIG.SEAT_MARGIN; 
      const deleteButtonMargin = seatMargin * TABLE_CONFIG.DELETE_BUTTON_DISTANCE_RATIO;
      const positions = [];
      
      for (let i = 0; i < capacity; i++) {
        const angle = (360 / capacity * i) * (Math.PI / 180); // 转换为弧度
        
        // 计算座位位置
        const seatX = Math.round(seatMargin * Math.sin(angle) * 100) / 100;
        const seatY = Math.round(-seatMargin * Math.cos(angle) * 100) / 100;
        
        // 计算删除按钮位置
        const buttonX = Math.round(deleteButtonMargin * Math.sin(angle) * 100) / 100;
        const buttonY = Math.round(-deleteButtonMargin * Math.cos(angle) * 100) / 100;
        
        positions.push({
          seat: { x: seatX, y: seatY, angle: (360 / capacity * i) },
          button: { x: buttonX, y: buttonY, angle: (360 / capacity * i) }
        });
      }
      
      return positions;
    },

    // 更新所有位置
    updatePositions() {
      const positions = {};
      this.data.tables.forEach(table => {
        if (!positions[table.capacity]) {
          positions[table.capacity] = this.calculatePositions(table.capacity);
        }
      });
      
      this.setData({
        seatPositions: positions
      });
      
      console.log('Positions updated:', positions);
    },
  }
});
