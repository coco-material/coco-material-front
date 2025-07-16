<template src="./App.html" lang="html"></template>
<style src="./App.scss" lang="scss"></style>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'app',
  data() {
    return {
      navOpen: false,
    }
  },
  methods: {
    openNav() {
      this.navOpen = !this.navOpen
    },
  },
})
</script>
