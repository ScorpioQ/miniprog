Component({
  behaviors: ['wx://form-field-group'],
  
  properties: {
    guests: {
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
    newGuest: {
      name: '',
      count: 1
    }
  },

  methods: {
    showAddGuest() {
      this.setData({
        showModal: true,
        newGuest: {
          name: '',
          count: 1
        }
      });
    },

    cancelAdd() {
      this.setData({
        showModal: false
      });
    },

    confirmAdd() {
      const { name, count } = this.data.newGuest;
      
      if (!name.trim()) {
        wx.showToast({
          title: '请输入姓名',
          icon: 'none'
        });
        return;
      }

      if (!count || count < 1) {
        wx.showToast({
          title: '请输入有效的人数',
          icon: 'none'
        });
        return;
      }

      this.triggerEvent('addGuest', {
        name: name.trim(),
        count: count,
        remainingCount: count
      });

      this.setData({
        showModal: false
      });
    },

    onNameInput(e) {
      this.setData({
        'newGuest.name': e.detail.value
      });
    },

    increaseCount() {
      const count = this.data.newGuest.count + 1;
      this.setData({
        'newGuest.count': count
      });
    },

    decreaseCount() {
      const count = Math.max(1, this.data.newGuest.count - 1);
      this.setData({
        'newGuest.count': count
      });
    },

    selectGuest(e) {
      const guest = e.currentTarget.dataset.guest;
      this.triggerEvent('selectGuest', guest);
    },

    onCountInput(e) {
      this.setData({
        'newGuest.count': e.detail.value
      });
    }
  }
});
