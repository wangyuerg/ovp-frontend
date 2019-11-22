import { axiosget } from '../../utils/http';
import API from '../../const/apis';
// import moment from 'moment';

const state = {
    linesData:{
        xAxis:[],
        legend:[],
        series:[]
    },
    testJobCirclesData:[],
    SUTAmountData:[],
    SUTAmountColors:["#46b8e0","#ffca52","#34314b"],
    jobAmountData:[],
    jobAmountColors:["#cae76e","#e94e75"],
    jobAmountClickText:["success","fail"],
    testEnvAmountData:[],
    testEnvAmountColors:["#ea9e9f","#f9ebc9","#a89c8e"],
};
const mutations = {
    updateLinesData(state, data) {
        if(data.length > 0){
            data.forEach((item)=>{
                Object.keys(data[0]).forEach((items)=>{
                    if(items === 'range')state.linesData.xAxis.push(item[items])
                    else if(state.linesData.legend.includes(items) ===false){
                        state.linesData.legend.push(items);
                        let singleData = [];
                        singleData.push(item[items])
                        state.linesData.series.push({
                            name:items,
                            type: "column",
                            data:singleData
                        })
                    }else {
                        state.linesData.series.map((seriesItem)=>{
                            if(seriesItem.name === items)seriesItem.data.push(item[items])
                        })
                    }
                })
            });
        }
        console.log(state.linesData,"----> state.linesData")
    },
    updateTestJobCirclesData(state, data) {
        if(Object.keys(data).length > 0){
            Object.keys(data).forEach((item)=>{
                let singleData = [];
                singleData.push(item,data[item]);
                state.testJobCirclesData.push(singleData)
            });
        }
        console.log(state.testJobCirclesData,"----> state.testJobCirclesData")
    },
    updateSUTAmountData(state, data) {
        if(Object.keys(data).length > 0){
            Object.keys(data).forEach((item,index)=>{
                state.SUTAmountData.push({
                    name:item,
                    y:data[item],
                    color:state.SUTAmountColors[index]
                });
            });
        }
        console.log(state.SUTAmountData,"----> state.SUTAmountData")
    },
    updateJobAmountData(state, data) {
        if(Object.keys(data).length > 0){
            Object.keys(data).forEach((item,index)=>{
                state.jobAmountData.push({
                    name:item,
                    y:data[item],
                    color:state.jobAmountColors[index],
                    events: {
                        click: () => {
                            this.clickChart(state.jobAmountClickText[index]);
                        }
                    }
                });
            });
        }
        console.log(state.jobAmountData,"----> state.jobAmountData")
    },
    updateTestEnvAmountData(state, data) {
        if(Object.keys(data).length > 0){
            Object.keys(data).forEach((item,index)=>{
                state.testEnvAmountData.push({
                    name:item,
                    y:data[item],
                    color:state.testEnvAmountColors[index]
                });
            });
        }
        console.log(state.testEnvAmountData,"----> state.testEnvAmountData")
    },

};
const actions = {
    getLinesData({ commit },{ message }) {
        axiosget(API.dashboard.PassCaseAmount7Days).then(res => {
            if (res.code === 200) {
                commit('updateLinesData', res.body);
            } else message.error('Network exception, please try again')
        },
            () => {
                message.error('Network exception, please try again')
            }
        )
    },
    getTestJobCirclesData({ commit },{ message }) {
        axiosget(API.dashboard.jobsFlowAmount).then(res => {
                if (res.code === 200) {
                    commit('updateTestJobCirclesData', res.body);
                } else message.error('Network exception, please try again')
            },
            () => {
                message.error('Network exception, please try again')
            }
        )
    },
    getSUTAmountData({ commit },{ message }) {
        axiosget(API.dashboard.sutAmount).then(res => {
                if (res.code === 200) {
                    commit('updateSUTAmountData', res.body);
                } else message.error('Network exception, please try again')
            },
            () => {
                message.error('Network exception, please try again')
            }
        )
    },
    getJobAmountData({ commit },{ message }) {
        axiosget(API.dashboard.jobsAmount).then(res => {
                if (res.code === 200) {
                    commit('updateJobAmountData', res.body);
                } else message.error('Network exception, please try again')
            },
            () => {
                message.error('Network exception, please try again')
            }
        )
    },
    getTestEnvAmountData({ commit },{ message }) {
        axiosget(API.dashboard.testEnvAmount).then(res => {
                if (res.code === 200) {
                    commit('updateTestEnvAmountData', res.body);
                } else message.error('Network exception, please try again')
            },
            () => {
                message.error('Network exception, please try again')
            }
        )
    },

};
const getters = {

};
export default {
    state, mutations, actions, getters, namespaced: true,
}