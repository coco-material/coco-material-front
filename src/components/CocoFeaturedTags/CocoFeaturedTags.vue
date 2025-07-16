<template src="./CocoFeaturedTags.html" lang="html"></template>
<style src="./CocoFeaturedTags.scss" lang="scss" scoped></style>

<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

export default defineComponent({
  name: 'CocoFeaturedTags',
  computed: {
    ...mapState('featured', {
      featuredVectors: (state) => state.featuredVectors,
    }),
  },
  beforeMount() {
    this.getFeaturedVectors()
  },
  methods: {
    ...mapActions({
      getFeaturedVectors: 'featured/getFeaturedVectors',
    }),
    searchVectorByTags(search, vectorId, ordering) {
      const query = {}

      if (search) {
        query.q = search.toLocaleLowerCase()
      }

      if (vectorId) {
        query.vectorId = vectorId
      }

      if (ordering) {
        query.ordering = ordering
      }

      this.$router.push({ path: '/results', query })
    },
    getImageAsStyleBackgroundAttr(vector) {
      if (vector.gif !== null || vector.coloredGif !== null) {
        return {
          backgroundImage: `url('${vector.coloredGif || vector.gif}')`,
        }
      } else {
        const svg64 = window.btoa(vector.coloredSvgContent || vector.svgContent)
        return {
          backgroundImage: `url('data:image/svg+xml;base64,${svg64}')`,
        }
      }
    },
  },
})
</script>
