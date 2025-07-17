<template src="./CocoResults.html" lang="html"></template>
<style src="./CocoResults.scss" lang="scss" scoped></style>

<script>
import { defineComponent } from 'vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import levenSort from 'leven-sort'

import CocoModal from '@/components/CocoModal/CocoModal.vue'

export default defineComponent({
  name: 'CocoResults',
  components: {
    'coco-modal': CocoModal,
  },
  data() {
    return {
      search: '',
      isModalVisible: false,
      selectedVector: null,
      svgCode: null,
      autocompleteResults: [],
      customizeBulk: false,
      isHorizontal: true,
      showScrollToTop: false,
      currentPage: 1,
      pageSize: 40,
      showNavBar: false,
      mobileView: false,
    }
  },
  computed: {
    ...mapState('tags', {
      tags: (state) => state.tags,
      searchTags: (state) => state.searchTags,
    }),
    ...mapState('results', {
      totalResults: (state) => state.totalResults,
      filteredVectors: (state) => state.filteredVectors,
      paginationArray: (state) => state.paginationArray,
      loading: (state) => state.loading,
      isShowingSimilarVectors: (state) => state.isShowingSimilarVectors,
    }),
  },
  async beforeMount() {
    // Load tags
    !this.searchTags.length && this.getTags()

    // Set current page
    this.currentPage = this.$route.query.page || this.currentPage

    // Get images
    const payload = {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      ordering: this.$route.query.ordering,
    }

    if (this.$route.query.q) {
      payload.tags = this.$route.query.q.split(',')
    }
    await this.getVectors(payload)

    // Open the vector detail modal if there is a vectorId
    if (this.$route.query.vectorId) {
      // Use strings in the comparation because they could be numbers or strings
      const index = this.filteredVectors.findIndex(
        (v) => `${v.id}` === `${this.$route.query.vectorId}`,
      )
      if (index !== -1) {
        const vector = this.filteredVectors[index]
        this.showModal(vector, false, index)
      }
    }
  },
  mounted() {
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= window.innerHeight * 1.5) {
        this.showScrollToTop = true
      } else {
        this.showScrollToTop = false
      }

      const formSearchEl = document.getElementById('formSearch')
      if (formSearchEl) {
        const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
        this.showNavBar = currentScrollPosition > formSearchEl.offsetTop + 30
        this.mobileView = window.innerWidth < 768
      }
    })
  },
  methods: {
    ...mapActions({
      getTags: 'tags/getTags',
      getVectors: 'results/getVectors',
    }),
    ...mapMutations({
      clearSearchTags: 'tags/clearSearchTags',
      updateSearchTags: 'tags/updateSearchTags',
      removeSearchTag: 'tags/removeSearchTag',
      clearFilteredVectors: 'results/clearFilteredVectors',
    }),
    showModal(vector, bulk, id) {
      this.selectedVector = vector
      const image = new Image()
      image.src = window
        .getComputedStyle(document.getElementById(`${id}`), false)
        .backgroundImage.slice(4, -1)
        .replace(/"/g, '')
      const height = image.height
      const width = image.width
      this.isHorizontal = height < width
      this.customizeBulk = bulk

      this.isModalVisible = true
    },
    showBulkModal(){
      let id = 0
      let vector = this.filteredVectors[id]
      let found = false

      // Select image with suggested colors
      for (const [i, v] of this.filteredVectors.entries()) {
        if (v.coloredSvg) {
          id = i
          vector = v
          found = true
          break
        }
      }

      // Select image with svg
      if (!found) {
        for (const [i, v] of this.filteredVectors.entries()) {
          if (v.svg) {
            id = i
            vector = v
            break
          }
        }
      }

      this.showModal(vector , true, id)
    },
    closeModal() {
      this.selectedVector = null
      this.isHorizontal = true
      this.customizeBulk = false

      this.isModalVisible = false
    },
    resetAutocompleteResults() {
      this.autocompleteResults = []
      document.getElementById('search').focus()
    },
    loaded(id) {
      const image = new Image()
      image.src = window
        .getComputedStyle(document.getElementById(`${id}`), false)
        .backgroundImage.slice(4, -1)
        .replace(/"/g, '')
      const height = image.height
      const width = image.width
      document.getElementById(id).className = height > width ? 'vertical' : 'horizontal'
    },
    autocompleteSearch(event) {
      if (event.code === 'Enter') {
        this.autocompleteResults = []
      } else {
        const text = this.search.toLocaleLowerCase()
        const results = this.tags.filter((it) => it.slug.indexOf(text) >= 0)
        this.autocompleteResults = levenSort(results, text, 'slug')
      }
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
    closeAutocomplete() {
      this.autocompleteResults = []
    },
    addTag(tag) {
      this.search = ''
      this.$refs.search && this.$refs.search.focus()
      this.autocompleteResults = []
      this.updateSearchTags(tag.toLocaleLowerCase())

      this.getVectors({
        tags: this.searchTags,
        currentPage: 1,
        pageSize: this.pageSize,
      })
      this.$router.push({ path: '/results', query: { q: this.searchTags.join(',') } })
    },
    removeTag(tag) {
      this.removeSearchTag(tag)
      if (this.searchTags.length) {
        this.getVectors({
          tags: this.searchTags,
          currentPage: 1,
          pageSize: this.pageSize,
          ordering: this.$route.query.ordering,
        })
        this.$router.push({ path: '/results', query: { q: this.searchTags.join(',') } })
      } else {
        this.getVectors({
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          ordering: this.$route.query.ordering,
        })
        this.$router.push({ path: '/results', query: { page: this.currentPage } })
      }
    },
    async downloadAll() {
      const tags = this.searchTags.length ? this.searchTags.join() : 'all'

      const queryUrl = new URLSearchParams()
      queryUrl.set('suggested', true)
      queryUrl.set('tags', tags)
      queryUrl.set('img_format', 'both')
      window.open(`${import.meta.env.VUE_APP_API_URL}/download/?${queryUrl.toString()}`, '_blank')
    },
    async download(vector) {
      const queryUrl = new URLSearchParams()
      queryUrl.set('suggested', true)
      queryUrl.set('id', vector.id)
      queryUrl.set('img_format', 'both')
      window.open(`${import.meta.env.VUE_APP_API_URL}/download/?${queryUrl.toString()}`, '_blank')
    },
    trackDownload(vector) {
      if (this.$matomo) {
        this.$matomo.trackEvent('downloads', 'svg', vector.name)
      }
    },
    searchVector(search) {
      const searchValues =
        typeof search === 'string' ? search.toLocaleLowerCase() : this.search.toLocaleLowerCase()

      for (const searchValue of searchValues.split(',')) {
        const val = searchValue.trim()
        if (val !== '') {
          this.addTag(val)
        }
      }
    },
    handleSearchVector(search) {
      this.clearSearchTags()
      this.addTag(search.toLocaleLowerCase())
    },
    searchModalVector(tag) {
      this.clearSearchTags()
      this.updateSearchTags(tag.replace(/\s/g, ''))
      this.getVectors({
        tags: this.searchTags,
        currentPage: 1,
        pageSize: this.pageSize,
      })
      this.$router.push({ path: '/results', query: { q: this.searchTags.join(',') } })
      this.isModalVisible = false
    },
    showAll() {
      this.clearSearchTags()
      this.getVectors({
        currentPage: 1,
        pageSize: this.pageSize,
        ordering: this.$route.query.ordering,
      })
    },
    handleDelete() {
      if (this.search === '') {
        this.removeTag(this.searchTags.slice(-1).pop())
      }
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePagination(page) {
      // Update current page
      this.currentPage = page

      const query = Object.assign({}, this.$route.query)
      if (this.currentPage > 1) {
        query.page = this.currentPage
      } else {
        delete query.page
      }
      this.$router.push({ query })

      // Load vectors
      if (this.searchTags.length) {
        this.getVectors({
          tags: this.searchTags,
          currentPage: page,
          pageSize: this.pageSize,
          ordering: this.$route.query.ordering,
        })
      } else {
        this.getVectors({
          currentPage: page,
          pageSize: this.pageSize,
          ordering: this.$route.query.ordering,
        })
      }
      this.scrollToTop()
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
