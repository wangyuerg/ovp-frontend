import Vue from 'vue';
import Vuex from 'vuex';
import login from './modules/login';
import router from './modules/router';
import testInstrument from './modules/testInstrument';
import testSpecMGT from './modules/testSpecMGT';
import VnfpnfSuite from './modules/VnfpnfSuite';
import testSUT from './modules/testSUT'
<<<<<<< HEAD
import testCase from './modules/testCase'
=======
import testJob from './modules/testJob'
>>>>>>> origin/dev

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    login,
    router,
    testInstrument,
    testSpecMGT,
    VnfpnfSuite,
    testSUT,
    testCase,
    testJob
  },

})

export default store;
