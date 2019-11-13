import {axiosget, axiospost, axiosput, axiosdelete} from '../../utils/http'
import { VIMForm, VNFMForm } from "../../const/constant";
import API from '../../const/apis';
import moment from 'moment'

const state = {
    loadingMessage: null,
    VIMTableData: [],
    VNFMTableData: [],
    pagination: {current:1,total:0},
    searchKeyword: '',
    createTime: '',
    pageNum: 1,
    pageSize: 10,
    currentTab: 'VIM ENV',
    visible: false,
    cloudTypeOptions: [],
    regionIdOptions: [],
    initValues: {}
}

const mutations = {
    updateTableData(state, res){
        state.pagination = {
            current: state.pageNum,
            total: res.total
        }
        let data = res.body.map( (item, index) => {
            item.action = ['Edit', 'Delete']
            item.index = res.body.length * (state.pagination.current -1) + index+1;
            item.createTime = moment(item.createTime).format('YYYY-MM-DD');
            return item
        })
        if(state.currentTab === 'VIM ENV') {
            state.VIMTableData = data
        }
        else state.VNFMTableData = data
    },
    changeTab(state, tab){
        state.currentTab = tab
    },
    setFilterItem(state,{time, key, pageObj, isSearch, message}){
        if(isSearch){
            if(key === '' && state.createTime === '' && state.searchKeyword === '') {
                message.warning('Please enter valid search information')
                return
            }    
        }
        if(time !== undefined) {
            state.createTime = time
            // Jump to the first page after adding search criteria
            if(state.pageNum !== 1){
                state.pageNum = 1
            }
        }else if(key !== undefined) {
            state.searchKeyword = key
            // Jump to the first page after adding search criteria
            if(state.pageNum !== 1){
                state.pageNum = 1
            }
        }
        else if(pageObj !== undefined) {
            state.pageNum = pageObj.current
            state.pageSize = pageObj.pageSize
        }
    },
    updateFailedMessage(state,toast){
        state.loadingMessage = {
            type: 'failed',
            toast
        }
    },
    updateSuccessMessage(state,toast){
        state.loadingMessage = {
            type: 'success',
            toast
        }
    },
    updateVisible(state, bool){
        state.visible = bool
    },
    updateRegionIdOptions(state,{ regionIdList }){
        state.regionIdOptions = regionIdList
    },
    updateCloudTypeOptions(state,{ CloudTypeList }){
        state.cloudTypeOptions = CloudTypeList
    },
    setInitValues(state, values){
        if(values.item !== "Edit"){
            state.initValues = values;
        }else {
            if(state.currentTab === "VIM ENV")VIMForm.forEach(item => {state.initValues[item.key] = values.record[item.key]})
            else {
                VNFMForm.forEach(item => {state.initValues[item.key] = values.record[item.key]})
                console.log(state.initValues,"state.initValues")
            }
            state.initValues.id = values.record.id;
        }
    }
}

const actions = {
    setParams({state, dispatch}){
        let paramsObj = {}
        if(state.createTime !== '') paramsObj.createTime = state.createTime
        if(state.searchKeyword !== '') {
            if(state.currentTab === 'VIM ENV'){
                paramsObj.cloudType = state.searchKeyword
            }else paramsObj.VNFMname = state.searchKeyword
        }
        if(state.pageNum !== '') {
            paramsObj.pageNum = state.pageNum
            paramsObj.pageSize = state.pageSize
        }
        dispatch('getTableData',{paramsObj,isFilter: true})
    },
    getTableData({commit, state}, {paramsObj, isFilter}){
        let url = state.currentTab === 'VIM ENV' ? API.vimVnfmMgt.vimEnvMgtTable: API.vimVnfmMgt.vnfmEnvMgtTable;
        paramsObj.pageNum = state.pageNum;
        paramsObj.pageSize = state.pageSize;
        axiosget(url, paramsObj).then(res => {
            if(res.code === 200){
                commit('updateTableData',res)
                if(isFilter) commit('updateSuccessMessage','Successfully get table data')
            }else {
                if(isFilter) commit('updateFailedMessage','Failed to get form data')
            }
        },() => {if(isFilter) commit('updateFailedMessage','Network exception, please try again')}
        )
    },
    deleteData({dispatch,commit,state},data){
        let url = state.currentTab === 'VIM ENV' ? API.vimVnfmMgt.vimEnvMgtDelete: API.vimVnfmMgt.vnfmEnvMgtDelete;
        axiosdelete(url.replace("id",data.id)).then( res => {
            if(res.code === 200){
                commit('updateSuccessMessage','Deleted successfully')
                let paramsObj = {pageNumstate: state.pageNum, pageSize: state.pageSize}
                dispatch('getTableData',{paramsObj})
            }else  commit('updateFailedMessage','Failed to delete')
        }).catch(() => {
            commit('updateFailedMessage','Network exception, please try again')
        })
    },
    getRegionIdOptions({commit, dispatch}){
        axiosget(API.vimVnfmMgt.cloudRegionID).then(res => {
            if(res.code === 200){
                let idList = [];
                    res.body.map((item)=>{
                        idList.push(item.dictValue)
                    });
                commit('updateRegionIdOptions',{regionIdList:idList})
                dispatch('getCloudTypeOptions', {selectRegionId:idList[0]})
            }else {
                this.$message.error('Network exception, please try again');
            }
        })
        // Simulation request
    },
    getCloudTypeOptions({commit},{selectRegionId}){
        let url = API.vimVnfmMgt.cloudType.replace(":cloudRegionID",selectRegionId);
        axiosget(url).then(res => {
            if(res.code === 200){
                let idList = [];
                res.body.map((item)=>{
                    idList.push(item.dictValue)
                });
                commit('updateCloudTypeOptions',{CloudTypeList:idList});
            }else {
                this.$message.error('Network exception, please try again');
            }
        })
        // Simulation request
    },
    loginVIN({state,commit, dispatch},{isEdit, data}){
        if(isEdit) data.id = state.initValues.id;
        let url = isEdit ? (state.currentTab === 'VIM ENV'? API.vimVnfmMgt.vimEnvMgtUpdate:API.vimVnfmMgt.vnfmEnvMgtUpdate) : (state.currentTab === 'VIM ENV'? API.vimVnfmMgt.vimEnvMgtInsert:API.vimVnfmMgt.vnfmEnvMgtInsert);
        let axiosType = isEdit ? axiosput : axiospost;
        axiosType(url, data)
            .then((res) => {
                if(res.code === 200){
                    commit('updateSuccessMessage',this.isEdit ? 'Successfully updated' : 'Has been added successfully');
                    let paramsObj = {
                        pageNum :state.pageNum,
                        pageSize :state.pageSize
                    }
                    dispatch('getTableData', {paramsObj})
                }else {
                    commit('updateFailedMessage',this.isEdit ? 'Update failed' : 'add failed')
                }
            },
            () => {
                commit('updateFailedMessage','Network exception, please try again')
            })
    }

}

const getters = {

}

export default { state, mutations, actions, getters, namespaced: true}