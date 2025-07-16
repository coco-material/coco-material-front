<template src="./CocoSuggestion.html" lang="html"></template>
<style src="./CocoSuggestion.scss" lang="scss" scoped></style>

<script>
import { defineComponent } from 'vue'
import api from '@/service/api'

export default defineComponent({
  name: 'CocoSuggestion',
  data() {
    return {
      form: {},
      isLoading: false,
      showSuccess: false,
      showError: false,
    }
  },
  methods: {
    async sendSuggestion() {
      if (!this.isLoading) {
        try {
          this.isLoading = true
          await api.sendSuggestion(this.form)
          this.showSuccessMessage()
        } catch (err) {
          console.log(err)
          this.showErrorMessage()
        } finally {
          this.isLoading = false
        }
      }
    },
    showSuccessMessage() {
      this.form = {}
      this.showError = false
      this.showSuccess = true
      setTimeout(() => {
        this.showSuccess = false
      }, 5000)
    },
    showErrorMessage() {
      this.showSuccess = false
      this.showError = true
      setTimeout(() => {
        this.showError = false
      }, 5000)
    },
  },
})
</script>
