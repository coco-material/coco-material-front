<template src="./CocoHome.html" lang="html"></template>
<style src="./CocoHome.scss" lang="scss" scoped></style>

<script>
import { defineComponent } from 'vue'
import { mapActions, mapState, mapMutations } from 'vuex'
import levenSort from 'leven-sort'

import CocoFonts from '@/components/CocoFonts/CocoFonts.vue'
import CocoSuggestion from '@/components/CocoSuggestion/CocoSuggestion.vue'
import CocoFeaturedTags from '@/components/CocoFeaturedTags/CocoFeaturedTags.vue'
import CocoFeaturedTopics from '@/components/CocoFeaturedTopics/CocoFeaturedTopics.vue'

export default defineComponent({
  name: 'CocoHome',
  components: {
    'coco-featured-tags': CocoFeaturedTags,
    'coco-featured-topics': CocoFeaturedTopics,
    'coco-fonts': CocoFonts,
    'coco-suggestion': CocoSuggestion,
  },
  data() {
    return {
      vectors: null,
      search: '',
      tagsToSearch: [],
      autocompleteResults: [],
      showScrollToTop: false,
    }
  },
  computed: {
    ...mapState('home', {
      totalVectors: (state) => state.totalVectors,
      latestVectors: (state) => state.latestVectors,
    }),
    ...mapState('tags', {
      tags: (state) => state.tags,
    }),
  },
  beforeMount() {
    this.clearSearchTags()
    this.getTags()
    this.getTotalVectors()
    this.getLatestVectors()
  },
  mounted() {
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= window.innerHeight * 1.5) {
        this.showScrollToTop = true
      } else {
        this.showScrollToTop = false
      }
    })
  },
  methods: {
    ...mapActions({
      getTotalVectors: 'home/getTotalVectors',
      getLatestVectors: 'home/getLatestVectors',
      getTags: 'tags/getTags',
    }),
    ...mapMutations({
      clearSearchTags: 'tags/clearSearchTags',
    }),
    autocompleteSearch() {
      const text = this.search.toLocaleLowerCase()
      const results = this.tags.filter((it) => it.slug.indexOf(text) >= 0)
      this.autocompleteResults = levenSort(results, text, 'slug')
    },
    focusAutocompleteResults(index, key) {
      event.stopPropagation()
      event.preventDefault()
      let topPos
      let elementHeight
      let element
      if (this.autocompleteResults.length) {
        if (key === 'down') {
          element = document.querySelectorAll('#results span')[index + 1]
          topPos = element.offsetTop
          elementHeight = element.clientHeight
          document.querySelector('#results').scrollTop = topPos - elementHeight
          element.focus({ preventScroll: true })
          if (index === -1) {
            setTimeout(() => {
              document.querySelector('#results').scrollTop = 0
            }, 100)
          }
        } else if (key === 'up' && index === 0) {
          document.querySelector('#search').focus()
        } else {
          element = document.querySelectorAll('#results span')[index - 1]
          topPos = element.offsetTop
          elementHeight = element.clientHeight
          document.querySelector('#results').scrollTop = topPos - elementHeight
          element.focus({ preventScroll: true })
        }
      }
    },
    resetAutocompleteResults() {
      this.autocompleteResults = []
      document.getElementById('search').focus()
    },
    closeAutocomplete() {
      this.autocompleteResults = []
    },
    addTag(tag) {
      this.tagsToSearch.push(tag.toLocaleLowerCase())
      this.search = ''
      this.$refs.search.focus()
      this.autocompleteResults = []
    },
    removeTag(tag) {
      const index = this.tagsToSearch.findIndex((it) => it === tag)
      this.tagsToSearch.splice(index, 1)
    },
    searchVector() {
      if (this.search !== '') {
        this.addTag(this.search.toLocaleLowerCase())
      }
      this.$router.push({ path: '/results', query: { q: this.tagsToSearch.join(',') } })
    },
    searchVectorByTopic(search, vectorId, ordering) {
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
    handleDelete() {
      if (this.search === '') {
        this.removeTag(this.tagsToSearch.slice(-1).pop())
      }
    },
    tagsSeparator(tags) {
      return tags.replace(/\s/g, '').split(',')
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
