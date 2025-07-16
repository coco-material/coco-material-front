import api from '@/service/api'

const state = () => ({
  totalVectors: null,
  latestVectors: null,
})

const mutations = {
  getTotalVectorsSuccess(state, totalVectors) {
    state.totalVectors = totalVectors
  },
  getLatestVectorsSuccess(state, vectors) {
    state.latestVectors = vectors
  },
}

const actions = {
  getTotalVectors({ commit }) {
    return api.getTotalVectors().then(({ totalVectors }) => {
      commit('getTotalVectorsSuccess', totalVectors)
    })
  },
  getLatestVectors({ commit }) {
    return api.getLatestVectors().then((latestVectors) => {
      commit('getLatestVectorsSuccess', latestVectors)
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
