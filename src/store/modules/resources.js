import api from '@/service/api'

const state = () => ({
  resources: {},
  lettersFont: null,
  iconsFont: null,
})

const mutations = {
  getResourcesSuccess(state, resourcesList) {
    state.resources = resourcesList.reduce((acc, r) => ({ ...acc, [r.slug]: r }), {})
    if (state.resources['letters-font']) {
      state.lettersFont = state.resources['letters-font'].file
    }
    if (state.resources['icons-font']) {
      state.iconsFont = state.resources['icons-font'].file
    }
  },
}

const actions = {
  getResources({ commit }) {
    return api.getResources().then((resources) => {
      commit('getResourcesSuccess', resources)
    })
  },
}

const resourcesStoreModule = {
  namespaced: true,
  state,
  mutations,
  actions,
}

export default resourcesStoreModule
