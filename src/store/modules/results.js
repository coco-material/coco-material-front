import api from '@/service/api'

const state = () => ({
  filteredVectors: [],
  paginationArray: [],
  totalResults: null,
  loading: false,
  isShowingSimilarVectors: false,
})

const mutations = {
  getVectorsSuccess(state, payload) {
    state.isShowingSimilarVectors = false
    state.filteredVectors = payload.vectors.results
    state.totalResults = payload.vectors.count
    state.paginationArray = Array.from(
      Array(Math.ceil(payload.vectors.count / payload.pageSize)).keys(),
    )
  },
  clearVectors(state) {
    state.isShowingSimilarVectors = false
    state.filteredVectors = []
    state.totalResults = null
    state.paginationArray = []
  },
  clearFilteredVectors(state) {
    state.filteredVectors = []
  },
  setLoading(state, activate) {
    state.loading = activate
  },
  showingSimilarVectors(state, activate) {
    state.isShowingSimilarVectors = activate
  },
}

const actions = {
  getVectors({ commit }, payload) {
    commit('clearVectors')
    commit('setLoading', true)
    return api.getVectors(payload).then((vectors) => {
      if (payload.tags) {
        commit('tags/setSearchTags', payload.tags, { root: true })
      }
      if (vectors.count > 0) {
        commit('getVectorsSuccess', { vectors, pageSize: payload.pageSize })
        commit('setLoading', false)
      } else {
        api.getSimilarVectors(payload).then((vectors) => {
          if (vectors.count > 0) {
            commit('getVectorsSuccess', { vectors, pageSize: payload.pageSize })
            commit('showingSimilarVectors', true)
          }
          commit('setLoading', false)
        })
      }
    })
  },
  getSimilarVectors({ commit }, payload) {
    commit('clearVectors')
    commit('setLoading', true)
    return api.getSimilarVectors(payload).then((vectors) => {
      if (payload.tags) {
        commit('tags/setSearchTags', payload.tags, { root: true })
      }
      commit('getVectorsSuccess', { vectors, pageSize: payload.pageSize })
      commit('showingSimilarVectors', true)
      commit('setLoading', false)
    })
  },
}

const resultsStoreModule = {
  namespaced: true,
  state,
  mutations,
  actions,
}

export default resultsStoreModule
