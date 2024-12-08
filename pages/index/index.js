// index.js
import { LAYOUT_CONFIG } from '../../constants/config'

Page({
  data: {
    guests: [],
    tables: [],
    selectedGuest: null,
    LAYOUT_CONFIG
  },

  showAddGuest() {
    this.selectComponent('#guestList').showAddGuest();
  },

  showAddTable() {
    this.selectComponent('#tableLayout').showAddTable();
  },

  onAddGuest(e) {
    const guest = {
      id: Date.now(),
      ...e.detail
    };
    
    this.setData({
      guests: [...this.data.guests, guest]
    });
  },

  onSelectGuest(e) {
    this.setData({
      selectedGuest: e.detail
    });
  },

  onAddTable(e) {
    this.setData({
      tables: [...this.data.tables, e.detail]
    });
  },

  onUpdateTableCapacity(e) {
    const { tableId, capacity } = e.detail;
    const tables = this.data.tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          capacity,
          seats: new Array(capacity).fill(null).map(() => ({
            guestId: null,
            guestName: ''
          }))
        };
      }
      return table;
    });

    this.setData({ tables });
  },

  onAssignSeat(e) {
    const { tableId, seatIndex, guestId, guestName } = e.detail;
    
    // 更新桌位信息
    const tables = this.data.tables.map(table => {
      if (table.id === tableId) {
        const seats = [...table.seats];
        seats[seatIndex] = { guestId, guestName };
        return { ...table, seats };
      }
      return table;
    });

    // 更新来宾剩余座位数
    const guests = this.data.guests.map(guest => {
      if (guest.id === guestId) {
        return {
          ...guest,
          remainingCount: guest.remainingCount - 1
        };
      }
      return guest;
    });

    // 如果来宾没有剩余座位，取消选中状态
    const selectedGuest = this.data.selectedGuest?.id === guestId && guests.find(g => g.id === guestId).remainingCount === 0
      ? null
      : this.data.selectedGuest;

    this.setData({
      tables,
      guests,
      selectedGuest
    });
  }
});
