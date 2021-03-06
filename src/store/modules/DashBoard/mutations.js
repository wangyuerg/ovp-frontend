import * as types from './mutations_types'
const mutations = {
  [types.UPDATE_LIVE_DATA](state, data) {
    state.liveData.x = data.x
    state.liveData.y = data.y
    // console.log(state.liveData,"state.liveData")
  },
  [types.UPDATE_LINES_DATA](state, data) {
    if (data && typeof data === 'object' && data.length > 0) {
      data.forEach(item => {
        Object.keys(data[0]).forEach(items => {
          if (items === 'time_range') state.linesData.xAxis.push(item[items])
          else if (!state.linesData.legend.includes(items)) {
            state.linesData.legend.push(items)
            let singleData = []
            singleData.push(item[items])
            state.linesData.series.push({
              name: items,
              type: 'column',
              data: singleData
            })
          } else {
            state.linesData.series.map(seriesItem => {
              if (seriesItem.name === items) seriesItem.data.push(item[items])
            })
          }
        })
      })
    } else {
      state.linesData = {
        xAxis: [],
        legend: [],
        series: []
      }
    }
  },
  [types.UPDATE_LINES_XAXIS_LENGTH](state, data) {
    if (data && typeof data === 'object') {
      state.linesxAxisLength = data.length
    }
  },
  [types.UPDATE_TESTJOB_CIRCLES_DATA](state, data) {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      Object.keys(data).forEach(item => {
        let singleData = []
        singleData.push(item, data[item])
        state.testJobCirclesData.push(singleData)
      })
    } else state.testJobCirclesData = []
  },
  [types.UPDATE_SUT_AMOUNT_DATA](state, data) {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      Object.keys(data).forEach((item, index) => {
        state.SUTAmountData.push({
          name:
            item === 'pnfcount'
              ? 'PNF Count'
              : item === 'nfvicount'
              ? 'NFVI Count'
              : 'VNF Count',
          y: data[item],
          color: state.SUTAmountColors[index]
        })
      })
    } else state.SUTAmountData = []
  },
  [types.UPDATE_JOB_AMOUNT_DATA](state, data) {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      Object.keys(data).forEach((item, index) => {
        state.jobAmountData.push({
          name: item === 'successcount' ? 'DONE' : 'FAILED',
          y: data[item],
          color: state.jobAmountColors[index],
          jobAmountClickText: state.jobAmountClickText[index]
        })
      })
    } else state.jobAmountData = []
  },
  [types.UPDATE_TESTENV_AMOUNT_DATA](state, data) {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      Object.keys(data).forEach((item, index) => {
        state.testEnvAmountData.push({
          name:
            item === 'manocount'
              ? 'Mano Count'
              : item === 'vimcount'
              ? 'VIM Count'
              : 'VNFM Count',
          y: data[item],
          color: state.testEnvAmountColors[index]
        })
      })
    } else state.testEnvAmountData = []
  }
}

export default mutations
