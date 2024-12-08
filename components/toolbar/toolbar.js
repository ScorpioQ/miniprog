Component({
  methods: {
    onAddGuest() {
      this.triggerEvent('addGuest');
    },

    onAddTable() {
      this.triggerEvent('addTable');
    }
  }
});
