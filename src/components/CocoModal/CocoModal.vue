<template src="./CocoModal.html" lang="html"></template>
<style src="./CocoModal.scss" lang="scss" scoped></style>

<script>
import { defineComponent } from 'vue'
import api from '@/service/api'

export default defineComponent({
  name: 'CocoModal',
  props: {
    vectorId: null,
    isHorizontal: null,
    customizeBulk: null,
    totalVectors: null,
    tags: null,
    isASuggestion: null,
  },
  data() {
    return {
      fillColor: ['#FFFFFF', '#ff7878', '#ffa569', '#ffde77', '#75e0d5', '#9bafff', 'none'],
      defaultFill: '#FFFFFF',
      strokeColor: ['#000000', '#ff7878', '#ffa569', '#ffde77', '#75e0d5', '#9bafff', '#FFFFFF'],
      defaultStroke: '#000000',
      vector: null,
      svgCode: null,
      vectorTags: [],
      hasJustStroke: false,
      hasColorSuggestion: false,
      // Form params
      downloadType: null, // values: png, svg
      colorOption: 'black-white', // values: black-white, color-suggestion, edit
      strokeHexValue: '#000000',
      fillHexValue: '#FFFFFF',
      downloadSuggested: false,
      size: 0, // values: 0, 128, 256, 512
      cooldown: false,
      preventKeys: false,
    }
  },
  computed: {
    // Form inputs options
    disableTypeSvg() {
      return !(this.vector && this.vector.svg)
    },
    disableTypePng() {
      return !(this.vector && this.vector.svg)
    },
    disableTypeGif() {
      return !this.customizeBulk && !((this.vector && (this.vector.gif || this.vector.coloredGif)))
    },
    disableColorBW() {
      return !this.customizeBulk && (this.downloadType === 'gif' && !this.vector.gif)
    },
    disableColorSuggestion() {
      return !this.customizeBulk && !(
        (this.downloadType !== 'gif' &&
          (this.vector.coloredSvg || this.vector.fillColor || this.vector.strokeColor)) ||
        (this.downloadType === 'gif' && this.vector.coloredGif)
      )
    },
    disableColorEdit() {
      return this.downloadType === 'gif'
    },
    disableSizeChoices() {
      return this.downloadType !== 'png'
    },
    // Vector values
    selectedGifUrl() {
      switch (this.colorOption) {
        case 'black-white':
          return this.vector.gif
        case 'color-suggestion':
          return this.vector.coloredGif
        default:
          return ''
      }
    },
  },
  async mounted() {
    document.body.style.width = document.body.clientWidth + 'px'
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.position = 'fixed'

    // Download vector
    await this._getVector(this.vectorId)

    // Add data to the url
    if (!this.customizeBulk) {
      const query = Object.assign({}, this.$route.query, { vectorId: this.vector.id })
      this.$router.replace({ query })
    }
  },
  async umounted() {
    document.body.style.position = undefined
  },
  created() {
    window.addEventListener('keydown', this.escapeHandler, true)
  },
  methods: {
    // Close modal
    escapeHandler(e) {
      if (!this.cooldown & !this.preventKeys) {
        if (e.key === 'ArrowLeft' && this.vector.neighbors.previous) {
          this.goToVector(this.vector.neighbors.previous.id)
        }
        if (e.key === 'ArrowRight' && this.vector.neighbors.next) {
          this.goToVector(this.vector.neighbors.next.id)
        }
        this.cooldown = true
        setTimeout(() => {
          this.cooldown = false
        }, 200)
      }
      if (e.key === 'Escape') {
        this.close()
      }
    },
    close() {
      const actualScroll = document.body.style.top
      document.body.style.position = null
      document.body.style.top = null
      document.body.style.width = null
      setTimeout(() => window.scrollTo(0, parseInt(actualScroll || '0') * -1), 100)

      this.$emit('close')

      // Delete data from url
      if (this.$route.query.vectorId) {
        const query = Object.assign({}, this.$route.query)
        delete query.vectorId
        this.$router.replace({ query })
      }
      window.removeEventListener('keydown', this.escapeHandler, true)
    },
    async _getVector(vectorId) {
      // const query = Object.assign({}, this.$route.query, { vectorId })
      // this.$router.push({ path: '/results', query })

      // Download vector
      this.vector = await api.getVector({
        id: vectorId,
        tags: !this.isASuggestion ? this.tags : [],
        similarity: this.isASuggestion ? this.tags : [],
        ordering: this.$route.query.ordering,
      })
      this.vectorTags = this.vector.tags.split(',')

      // Set svg
      if (this.vector.svg) {
        this.svgCode = this.vector.svgContent

        // Check if the image has only one path
        const svgEl = document.createElement('div')
        svgEl.innerHTML = this.svgCode
        this.hasJustStroke = svgEl.querySelectorAll('path').length === 1
      }

      // Select options
      if (this.vector.coloredGif) {
        this.selectDownloadTypeGif()
        this.selectColorSuggestion()
      } else if (this.vector.gif) {
        this.selectDownloadTypeGif()
        this.selectColorBlackAndWhite()
      } else {
        this.selectDownloadTypePng()
        // Check if image has color suggestion
        this.hasColorSuggestion =
          this.vector.coloredSvg || this.vector.fillColor || this.vector.strokeColor

        // If hasColorSuggesteion select it by default
        if (this.hasColorSuggestion) {
          this.selectColorSuggestion()
        }
      }
    },
    async goToVector(vectorId) {
      // Inicialize form params
      this.downloadType = 'png' // values: png, svg
      this.colorOption = 'black-white' // values: black-white, color-suggestion, edit
      this.strokeHexValue = '#000000'
      this.fillHexValue = '#FFFFFF'
      this.downloadSuggested = false
      this.size = 0 // values: 0, 128, 256, 512

      // Download vector
      await this._getVector(vectorId)

      // Add data to the url
      const query = Object.assign({}, this.$route.query, { vectorId })
      this.$router.replace({ query })
    },
    // Tag clicked
    searchVector(tag) {
      this.close()
      this.$emit('search', tag)
    },
    // Download type settings
    selectDownloadTypePng() {
      this.downloadType = 'png'
      this.size = 0
    },
    selectDownloadTypeSvg() {
      this.downloadType = 'svg'
      this.size = 0
    },
    selectDownloadTypeGif() {
      this.downloadType = 'gif'
      this.size = 0
    },

    // Color settings
    //
    // NOTE:
    //  Images could have one or two paths:
    //    - Images with two path:
    //       * Path 0 is fill
    //       * Path 1 is stroke
    //    - Images with one path:
    //       * Path 0 is stroke
    //
    selectColorBlackAndWhite() {
      this.colorOption = 'black-white'

      this.svgCode = this.vector.svgContent
      this.downloadSuggested = false
      this.selectFill()
      this.selectStroke()
    },
    selectColorSuggestion() {
      this.colorOption = 'color-suggestion'

      this.svgCode = this.vector.coloredSvgContent
      if (this.vector.coloredSvg) {
        this.downloadSuggested = true
      } else {
        this.downloadSuggested = false
        this.selectFill(this.vector.fillColor)
        this.selectStroke(this.vector.strokeColor)
      }

      if (this.customizeBulk || this.downloadType === 'gif') {
        this.downloadSuggested = true
      }
    },
    selectColorEdit() {
      this.colorOption = 'edit'

      this.strokeHexValue = '#000000'
      this.fillHexValue = '#FFFFFF'
      this.svgCode = this.vector.svgContent
      this.downloadSuggested = false
    },
    selectStroke(color) {
      const pathIdx = this.hasJustStroke ? 0 : 1
      const pathEl = document.querySelectorAll('#preview path')[pathIdx]

      if (color) {
        if (color.length === 7) {
          this.strokeHexValue = color
        } else {
          return // invalid hex color
        }
      } else {
        this.strokeHexValue = this.defaultStroke
      }

      if (pathEl) {
        pathEl.style.fill = this.strokeHexValue
      }
    },
    selectFill(color) {
      if (this.hasJustStroke) {
        return // Threre is no fill to set
      }
      const pathEl = document.querySelectorAll('#preview path')[0]

      if (color) {
        if (color.length === 7 || color === 'none') {
          this.fillHexValue = color
        } else {
          return // invalid hex color
        }
      } else {
        this.fillHexValue = this.defaultFill
      }

      if (pathEl) {
        pathEl.style.fill = this.fillHexValue
      }
    },
    // Submit form
    download() {
      const queryUrl = new URLSearchParams()

      // img format
      queryUrl.set('img_format', this.downloadType)

      // size
      if (!(this.downloadType === 'svg')) {
        queryUrl.set('size', this.size)
      }

      if (!this.downloadSuggested) {
        // fill
        const fill = this.fillHexValue
          ? this.fillHexValue.replace('#', '')
          : this.defaultFill.replace('#', '')
        queryUrl.set('fill', fill)

        // stroke
        const stroke = this.strokeHexValue
          ? this.strokeHexValue.replace('#', '')
          : this.defaultStroke.replace('#', '')
        queryUrl.set('stroke', stroke)
      } else {
        // select suggested vector
        queryUrl.set('suggested', true)
      }

      if (this.customizeBulk) {
        // tags
        const tags = this.tags.length ? this.tags.join() : 'all'
        queryUrl.set('tags', tags)
      } else {
        // id
        queryUrl.set('id', this.vector.id)
      }

      // and download the image
      window.open(`${import.meta.env.VUE_APP_API_URL}/download/?${queryUrl.toString()}`, '_blank')
      this.trackDownload()
    },
    trackDownload() {
      if (this.$matomo) {
        const category = this.customizeBulk ? 'download-bulk' : 'download'
        const action = this.downloadType === 'svg' ? 'svg' : `${this.downloadType}-${this.size}`
        const name = this.customizeBulk
          ? this.tags.length
            ? this.tags.join()
            : 'all'
          : this.vector.name
        this.$matomo.trackEvent(category, action, name)
      }
    },
  },
})
</script>
