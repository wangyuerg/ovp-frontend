const state = {
  tableData: [
    {
      caseMgt: [],
      id: ''
    }
  ],
  testCasetableLoading: false,
  visible: false,
  SUTOptions: [],
  VNFOptions: [],
  testCaseList: [],
  testSpecSingleData: {},
  testCaseCheckAll: false,
  initcheckboxGroup: [],
  dropdownSpec: [],
  dropdownSpecIndex: 0,
  pagination: { current: 1, total: 0, pageSize: 10 },
  editStatus: false
}

export default state
