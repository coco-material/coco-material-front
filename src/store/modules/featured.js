import api from '@/service/api'

const state = () => ({
  featuredVectors: null,
})

const mutations = {
  getFeaturedVectorsSuccess(state, vectors) {
    state.featuredVectors = vectors
  },
}

const actions = {
  getFeaturedVectors({ commit }) {
    return api.getFeaturedVectors().then((featuredVectors) => {
      commit('getFeaturedVectorsSuccess', featuredVectors)
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
