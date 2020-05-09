import { axiosget, axiospost, axiosput, axiosdelete } from '../../../utils/http';
import { axiosgetType } from '../../../const/constant';
import API from '../../../const/apis';
import * as types from './mutations_types';

const actions = {
  setParams ({ state, dispatch }) {
    let paramsObj = {};
    if (state.createTime !== '') paramsObj.createTime = state.createTime;
    if (state.searchKeyword !== '') {
      if (state.currentTab === 'VIM ENV') {
        paramsObj.dictLabel = state.searchKeyword;
      } else paramsObj.name = state.searchKeyword;
    }
    if (state.pageNum !== '') {
      paramsObj.pageNum = state.pageNum;
      paramsObj.pageSize = state.pageSize;
    }
    dispatch('getTableData', { paramsObj, isFilter: true });
  },
  getTableData ({ dispatch, commit, state }, { paramsObj, isFilter }) {
    let url = '';
    switch (state.currentTab) {
      case 'VIM ENV':
        url = API.vimVnfmMgt.vimEnvMgtTable;
        break;
      case 'VNFM ENV':
        url = API.vimVnfmMgt.vnfmEnvMgtTable;
        break;
      case 'MANO ENV':
        url = API.vimVnfmMgt.manoEnvMgtTable;
        break;
      default:
        break;
    }

    paramsObj.pageNum = state.pageNum;
    paramsObj.pageSize = state.pageSize;
    let axiosrequest = axiosgetType ? axiospost : axiosget;
    dispatch('loading/tableLoading', true, { root: true });
    let failedCallback = () => {
      if (isFilter) {
        dispatch(
          'loading/showLoading',
          { type: 'failed', toast: 'Failed to get form data' },
          { root: true }
        );
      }
    };
    axiosrequest(url, paramsObj, failedCallback).then(
      res => {
        if (res.code === 200) {
          commit(types.UPDATE_TABLE_DATA, res);
          dispatch('loading/tableLoading', false, { root: true });
          if (isFilter)
            dispatch(
              'loading/showLoading',
              { type: 'success', toast: 'Successfully get table data' },
              { root: true }
            );
        }
      },
      () => {
        if (isFilter)
          dispatch(
            'loading/showLoading',
            { type: 'failed', toast: 'Network exception, please try again' },
            { root: true }
          );
      }
    );
  },
  deleteData ({ dispatch, state }, { data }) {
    let url = '';
    switch (state.currentTab) {
      case 'VIM ENV':
        url = API.vimVnfmMgt.vimEnvMgtDelete;
        break;
      case 'VNFM ENV':
        url = API.vimVnfmMgt.vnfmEnvMgtDelete;
        break;
      case 'MANO ENV':
        url = API.vimVnfmMgt.manoMgtDelete;
        break;
      default:
        break;
    }
    axiosdelete(url.replace(':id', data.id))
      .then(res => {
        if (res.code === 200) {
          dispatch(
            'loading/showLoading',
            { type: 'success', toast: 'Deleted successfully' },
            { root: true }
          );
          let paramsObj = {
            pageNumstate: state.pageNum,
            pageSize: state.pageSize
          };
          dispatch('getTableData', { paramsObj });
        }
      })
      .catch(() => {
        dispatch(
          'loading/showLoading',
          { type: 'failed', toast: 'Network exception, please try again' },
          { root: true }
        );
      });
  },
  getRegionIdOptions ({ commit, dispatch }) {
    axiosget(API.vimVnfmMgt.cloudRegionID).then(res => {
      if (res.code === 200) {
        let idList = [];
        res.body.map(item => {
          idList.push(item.dictValue);
        });
        commit(types.UPDATE_REGION_ID_OPTIONS, { regionIdList: idList });
        dispatch('getCloudTypeOptions', { selectRegionId: idList[0] });
      } else {
        this.$message.error('Network exception, please try again');
      }
    });
    // Simulation request
  },
  getCloudTypeOptions ({ commit }) {
    let url = API.vimVnfmMgt.cloudType;
    axiosget(url).then(res => {
      if (res.code === 200) {
        commit(types.UPDATE_CLOUD_TYPE_OPTIONS, { CloudTypeList: res.body });
      } else {
        this.$message.error('Network exception, please try again');
      }
    });
    // Simulation request
  },
  loginVIN ({ state, dispatch }, { isEdit, data }) {
    if (isEdit) data.id = state.initValues.id;
    let url = isEdit
      ? state.currentTab === 'VIM ENV'
        ? API.vimVnfmMgt.vimEnvMgtUpdate
        : state.currentTab === 'VNFM ENV'
        ? API.vimVnfmMgt.vnfmEnvMgtUpdate
        : API.vimVnfmMgt.manoMgtUpdate.replace(':manoId', data.id)
      : state.currentTab === 'VIM ENV'
      ? API.vimVnfmMgt.vimEnvMgtInsert
      : state.currentTab === 'VNFM ENV'
      ? API.vimVnfmMgt.vnfmEnvMgtInsert
      : API.vimVnfmMgt.manoMgtInsert;
    let axiosType = isEdit ? axiosput : axiospost;
    axiosType(url, data).then(
      res => {
        if (res.code === 200) {
          dispatch(
            'loading/showLoading',
            {
              type: 'success',
              toast: this.isEdit
                ? 'Successfully updated'
                : 'Has been added successfully'
            },
            { root: true }
          );
          let paramsObj = {
            pageNum: state.pageNum,
            pageSize: state.pageSize
          };
          dispatch('getTableData', { paramsObj });
        }
      },
      () => {
        dispatch(
          'loading/showLoading',
          { type: 'failed', toast: 'Network exception, please try again' },
          { root: true }
        );
      }
    );
  },
  getMANOTypeOptions ({ commit }) {
    let url = API.vimVnfmMgt.MANOType;
    axiosget(url).then(res => {
      if (res.code === 200) {
        commit(types.UPDATE_CLOUD_TYPE_OPTIONS, { CloudTypeList: res.body });
      } else {
        this.$message.error('Network exception, please try again');
      }
    });
  }
};

export default actions;