import moment from 'moment'
import API from '../../../const/apis'
import util from '../../../utils/utils'
import router from '../../../router/router'
import { testJobDetailInstrumentColumns } from '../../../pages/TestJob/constants'
import { axiospost, axiosget, axiosput, axiosdelete } from '../../../utils/http'
import state from './state'
import * as types from './mutations_types'

const actions = {
  getTableData({ dispatch, commit }, { bool, loading = true }) {
    let obj = { pageNum: state.pageNum, pageSize: state.pageSize }
    if (state.createTime !== '') obj.createTime = state.createTime
    if (state.searchKeyword !== 'All' && state.dashboardJumpStatus === 'All') {
      obj.jobStatus = state.searchKeyword
    }
    if (state.searchKeyword === 'All' && state.dashboardJumpStatus !== 'All') {
      obj.jobStatus = state.dashboardJumpStatus
    }
    if (loading) {
      dispatch('loading/tableLoading', true, { root: true })
    }
    axiosget(API.testJobMgt.testJobTable, obj)
      .then(res => {
        if (loading) dispatch('loading/tableLoading', false, { root: true })
        state.pagination = {
          current: state.pageNum,
          total: res.total
        }
        let tableData = res.body.map((item, index) => {
          item.createTime = moment(item.createTime).format('YYYY-MM-DD')
          item.index =
            res.body.length * (state.pagination.current - 1) + index + 1
          item.actions = [
            item.jobStatus === 'RUNNING' ? 'Stop' : 'Start',
            'Edit',
            'Delete',
            'Download',
            'More'
          ]
          return item
        })
        commit(types.UPDATE_TABLE_DATA, tableData)
      })
      .catch(() => {
        if (bool)
          dispatch(
            'loading/showLoading',
            {
              type: 'failed',
              toast: 'Network exception, please try again'
            },
            { root: true }
          )
      })
  },
  createrTestJobMGT(
    { dispatch, commit, state },
    { isEdit, values, caseReqs, message }
  ) {
    let body = {
      cronExpression: '',
      endpoint: '/portal/business/jobs/case/start',
      executionType: 'ONCE',
      fixedExecutionInterval: '0',
      fixedExecutionUnit: '',
      jobName: values.JobName,
      remark: values.JobDescription,
      // SUTType: values.SUTType,
      sutId: values.SUTName.split('+')[1],
      specId: values.TestSpecification,
      // createrTime: moment(new Date()).format('YYYY-MM-DD'),
      caseReqs: caseReqs
    }
    if (values.TestVIMENV) body.vimId = values.TestVIMENV
    if (values.TestVNFMENV) body.vnfmId = values.TestVNFMENV
    if (values.TestMANOENV) body.manoId = values.TestMANOENV
    if (values.TestInstrument) body.suiteIds = values.TestInstrument
    let jobId = isEdit ? state.testJobSingleData.jobId : ''
    // if (isEdit) body.jobId = jobId;
    let url = isEdit
      ? API.testJobMgt.testJobUpdate.replace(':jobId', jobId)
      : API.testJobMgt.testJobInsert
    let axiosType = isEdit ? axiosput : axiospost
    axiosType(url, body)
      .then(
        () => {
          dispatch(
            'loading/showLoading',
            {
              type: 'success',
              toast: 'Has been added successfully'
            },
            { root: true }
          )
          commit(types.SET_IS_SHOW, false)
          dispatch('getTableData', false)
        },
        () => {
          message.error('Network exception, please try again')
        }
      )
      .catch(() => {
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      })
  },
  getSUTType({ commit }, { message }) {
    commit(types.UPDATA_SUT_TYPE, {
      get: false,
      spin: true
    })
    axiosget(API.testJobMgt.testJobSUTType).then(
      res => {
        setTimeout(() => {
          commit(types.UPDATA_SUT_TYPE, {
            list: res.body
          })
        }, 1000)
      },
      () => {
        message.error('Network exception, please try again')
      }
    )
  },
  getSUTName({ commit }, { SUTType, message }) {
    commit(types.UPDATA_SUT_NAME, {
      get: false,
      spin: true
    })
    axiosget(API.testJobMgt.testJobSUTName.replace(':code', SUTType)).then(
      res => {
        if (res.code === 200) {
          // Simulation request
          setTimeout(() => {
            commit(types.UPDATA_SUT_NAME, {
              get: true,
              spin: false,
              list: res.body
            })
          }, 1000)
        } else {
          message.error('Failed to get SUT Name list')
          commit(types.UPDATA_SUT_NAME, {
            get: false,
            spin: false
          })
        }
      },
      () => {
        message.error('Network exception, please try again')
        commit(types.UPDATA_SUT_NAME, {
          get: false,
          spin: false
        })
      }
    )
  },
  getSpecification({ commit }, { SUTName, message }) {
    commit(types.UPDATE_SPECIFICATION, {
      get: false,
      spin: true
    })
    axiosget(API.testJobMgt.testJobSpec.replace(':type', SUTName)).then(
      res => {
        if (res.code === 200) {
          // Simulation request
          setTimeout(() => {
            commit(types.UPDATE_SPECIFICATION, {
              get: true,
              spin: false,
              list: res.body
            })
          }, 1000)
        } else {
          message.error('Failed to get Test Specification list')
          commit(types.UPDATE_SPECIFICATION, {
            get: false,
            spin: false
          })
        }
      },
      () => {
        message.error('Network exception, please try again')
        commit(types.UPDATE_SPECIFICATION, {
          get: false,
          spin: false
        })
      }
    )
  },
  getTestCase({ commit }, { obj, message }) {
    commit(types.UPDATE_TEST_CASE_LIST, { spin: true })
    commit(types.UPDATE_FAIL_DETAIL, '')
    axiosget(API.testJobMgt.testJobTestCase, obj).then(
      res => {
        if (res.code === 200) {
          commit(types.UPDATE_TEST_CASE_LIST, {
            spin: false,
            list: res.body
          })
        } else {
          message.error('Failed to get Test Case list')
          commit(types.UPDATE_TEST_CASE_LIST, { spin: false })
        }
      },
      () => {
        message.error('Network exception, please try again')
        commit(types.UPDATE_TEST_CASE_LIST, {
          spin: false
        })
      }
    )
  },
  getTestFail({ dispatch }, data) {
    axiosget(
      API.testJobMgt.testFailedDetail.replace(':requestId', data.requestId)
    )
      .then(res => {
        if (+res.code === 200) {
          let reason = JSON.stringify(res.body)
          util.pasteContent(reason)
          // commit('updateFailDetail', reason);
        } else {
          util.pasteContent('')
          dispatch(
            'loading/showLoading',
            { type: 'failed', toast: 'Get detail reason failed' },
            { root: true }
          )
        }
      })
      .catch(err => {
        console.warn(err)
      })
  },
  delete({ dispatch }, { data }) {
    axiosdelete(
      API.testJobMgt.testJobDelete.replace(':jobId', data.jobId)
    ).then(
      () => {
        dispatch(
          'loading/showLoading',
          { type: 'success', toast: 'Deleted successfully' },
          { root: true }
        )
        dispatch('getTableData', false)
      },
      () => {
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      }
    )
  },
  download({ dispatch }, data) {
    let url =
      API.testJobMgt.testJobDownLoad.replace(':jobId', data.jobId) +
      '?lang=' +
      data.lang
    window.open(window.location.protocol + '//' + window.location.host + url)
    dispatch(
      'loading/showLoading',
      { type: 'success', toast: 'DownLoad File successfully' },
      { root: true }
    )
  },
  runTestJobMGT({ dispatch, commit }, { data }) {
    axiosput(API.testJobMgt.testJobStart.replace(':jobId', data.jobId)).then(
      res => {
        dispatch(
          'loading/showLoading',
          { type: 'success', toast: 'Successfully started testing' },
          { root: true }
        )
        data.status = 'RUNNING'
        data.jobStatus = 'STARTED'
        data.actions[0] = 'Stop'
        data.jobId = res.body.jobId
        data.executionStartTime = res.body.executionStartTime
        commit(types.UPDATE_TABLE_ITEM_DATA, data)
        router.push({
          name: 'JobDetail',
          query: {
            detail: JSON.stringify(data)
          }
        })
      },
      () => {
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      }
    )
  },
  getProgress({ commit }, { jobId, message }) {
    axiosget(API.testJobMgt.testJobProgress.replace(':jobId', jobId)).then(
      res => {
        commit(types.UPDATE_PROGRESS, {
          percent: res.body.jobProgress,
          status: res.body.jobStatus
        })
        // res.body.cases.map(item => {
        //    res.body.scheduleCases.map(items=>{
        //    	if(item.id === items.caseId){
        //            items.name = item.name
        // 		}
        // 	})
        // });
        commit(types.UPDATE_DETAIL_TEST_CASE, res.body.scheduleCases) // record！！！ 为了避免caseMgt没有了，先把它取出来再塞进去
        let doneCaseNum = 0,
          failedCaseNum = 0
        if (res.body.scheduleCases && res.body.scheduleCases.length !== 0) {
          res.body.scheduleCases.forEach(item => {
            if (item.caseStatus === 'DONE') {
              doneCaseNum++
            } else if (item.caseStatus === 'FAILED') {
              failedCaseNum++
            }
          })
        }
        commit(types.UPDATE_TEST_CASE_PIE_DATA, {
          doneCaseNum,
          failedCaseNum
        })
        if (
          res.body.jobProgress !== null &&
          res.body.jobProgress !== undefined
        ) {
          commit(types.UPDATE_DETAIL_LOADING, false)
          commit(types.UPDATE_EXECUTION_START_TIME, res.body.executionStartTime)
        }
      },
      () => {
        message.error('Network exception, please try again')
      }
    )
  },
  getTestJobCaseExecutions( // 用于testjob的detail页面子表格的数据获取
    { dispatch, commit },
    { record, expanded, jobId, message, isSeagull }
  ) {
    dispatch('loading/tableLoading', true, { root: true })
    const obj = { jobId: jobId }
    axiosget(
      API.testJobMgt.testJobCaseExecutions.replace(
        ':requestId',
        record.requestId
      ),
      obj
    ).then(
      res => {
        dispatch('loading/tableLoading', false, { root: true })
        if (res.body.length !== 0) {
          commit(types.UPDATE_EXPANDED_ROW_KEYS, {
            key: record.index,
            expanded
          })
          if (isSeagull) {
            // 如果是海鸥要做一些处理
            let dataSource = [] // 处理完的表格对象数组
            if (res.body !== null && res.body) {
              let data
              if (typeof res.body == 'string') {
                data = JSON.parse(res.body)
              } else {
                data = res.body
              }
              console.log(typeof res.body)
              //  const data =res.body;
              // 返回的是对象字符串
              for (let key in data) {
                // 对象中的每一个键值对就是表格里的每一行
                if (key !== 'total') {
                  let newItem = {}
                  testJobDetailInstrumentColumns.forEach(item => {
                    if (item.source === 'key') {
                      newItem[item.dataIndex] = key
                    } else {
                      newItem[item.dataIndex] = data[key][item.dataIndex]
                    }
                  })
                  // 处理需要计算的
                  let islegal = true
                  // 如果结果有undefined, 不push, ''可以
                  for (let i in newItem) {
                    if (
                      typeof newItem[i] === 'undefined' ||
                      newItem[i] === null ||
                      newItem[i] === 'none' ||
                      newItem[i] === 'None'
                    ) {
                      islegal = false
                    }
                  }
                  if (islegal) {
                    dataSource.push(newItem)
                  }
                }
              }
            }
            commit(types.UPDATE_CASE_CHILD_TABLE_DATA, {
              // 结果赋值
              testCaseChildData: dataSource,
              record
            })
          } else {
            commit(types.UPDATE_CASE_CHILD_TABLE_DATA, {
              // 结果赋值
              testCaseChildData: res.body,
              record
            })
          }
        } else {
          message.info('No child data under this test case.')
        }
      },
      () => {
        commit('setTestCaseChildtableLoading', false)
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      }
    )
  },
  stopJop({ dispatch, commit }, { data }) {
    // Simulation request
    axiosput(API.testJobMgt.testJobStop.replace(':jobId', data.jobId)).then(
      () => {
        dispatch(
          'loading/showLoading',
          { type: 'success', toast: 'Successfully stoped testing' },
          { root: true }
        )
        data.status = 'STOPPED'
        data.actions[0] = 'Start'
        commit(types.UPDATE_TABLE_ITEM_DATA, data)
        dispatch('getTableData', true)
      },
      () => {
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      }
    )
    dispatch('getTableData', true)
  },
  getVNFMOption({ commit }, { message }) {
    axiosget(API.vimVnfmMgt.vnfmEnvMgtTable).then(
      res => {
        commit(types.UPDATE_VNFM_OPTION, res.body)
      },
      () => {
        message.error('Network exception, please try again')
      }
    )
  },
  getVIMOption({ commit }, { message }) {
    axiosget(API.vimVnfmMgt.vimEnvMgtTable).then(
      res => {
        commit(types.UPDATE_VIM_OPTION, res.body)
      },
      () => {
        message.error('Network exception, please try again')
      }
    )
  },
  getMANOOption({ commit }, { message }) {
    let obj = { pageSize: 100 }
    axiosget(API.vimVnfmMgt.manoEnvMgtTable, obj).then(
      res => {
        commit(types.UPDATE_MANO_OPTION, res.body)
      },
      () => {
        message.error('Network exception, please try again')
      }
    )
  },
  getTestInstrumentOption({ commit }, { message }) {
    let obj = {
      pageSize: 100,
      flag: 101
    }
    axiosget(API.suiteMgt.suiteMgtTable, obj).then(
      res => {
        commit(types.UPDATE_TEST_INSTRUMENT_OPTION, res.body)
      },
      () => {
        message.error('Network exception, please try again')
      }
    )
  },
  getEditTestJob({ dispatch, commit }, { data }) {
    axiosget(API.testJobMgt.testJobProgress.replace(':jobId', data.jobId)).then(
      res => {
        commit(types.UPDATE_TESTJOB_SINGLE_DATA, res.body)
        if (Object.keys(res.body).length > 0) {
          let checkedboxGroup = res.body.cases.map(item => {
            return item.id
          })
          commit(types.UPDATE_INIT_CHECKBOX_GROUP, checkedboxGroup)
        }
        let obj = {
          specId: res.body.spec.id,
          sutId: res.body.sut.id
        }
        dispatch('getTestCase', { obj, message: this.$message })
      },
      () => {
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      }
    )
  },
  jobVNFCsarsUplaod({ dispatch }, { jobId, sutvalidLind, confirm }) {
    dispatch(
      'loading/showLoading',
      { type: 'success', toast: '', toastOpen: false },
      { root: true }
    )
    let updata = () => {
      confirm({
        title: 'Do you need to upload this file again?',
        content: 'jobId: ' + jobId,
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          dispatch('jobCaseVNFReupload', { jobId, sutvalidLind })
        }
      })
    }
    axiospost(
      API.testJobMgt.testJobCaseVNFUplaod.replace(':jobId', jobId),
      null,
      null,
      updata
    ).then(
      () => {
        dispatch(
          'loading/showLoading',
          { type: 'success', toast: '', toastOpen: false },
          { root: true }
        )
        window.open(sutvalidLind, '_blank')
      },
      () => {
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      }
    )
  },
  jobCaseVNFReupload({ dispatch }, { jobId, sutvalidLind }) {
    dispatch(
      'loading/showLoading',
      { type: 'success', toast: '', toastOpen: false },
      { root: true }
    )
    axiospost(
      API.testJobMgt.testJobCaseVNFReupload.replace(':jobId', jobId)
    ).then(
      () => {
        window.open(sutvalidLind, '_blank')
      },
      () => {
        dispatch(
          'loading/showLoading',
          {
            type: 'failed',
            toast: 'Network exception, please try again'
          },
          { root: true }
        )
      }
    )
  }
}

export default actions
