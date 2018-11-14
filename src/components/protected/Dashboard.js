import React, { Component } from 'react';
import '../../App.css';
import DataApp from './DataApp';
import AddData from './AddData';

// Import outside libraries
import Rebase from 're-base';
import * as moment from 'moment';
import Papa from 'papaparse';
import alasql from 'alasql';
import { v4 } from 'uuid';
import _ from 'lodash'
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import CodeMirror from 'react-codemirror';
import { ToastContainer } from 'react-toastify'

// sql text editor
import '../../../node_modules/codemirror/mode/sql/sql';
import '../../../node_modules/codemirror/keymap/sublime';
import '../../../node_modules/codemirror/theme/monokai.css';
import 'codemirror/lib/codemirror.css'
//import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css'
import 'react-toastify/dist/ReactToastify.css';


// Sliding Panel
import Modal from 'react-modal';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';

// my components
import { database, firebaseAuth } from '../../config/firebase';
import { logout } from '../../helper/auth';

//connecting firebase database
let base = Rebase.createClass(database);

class Dashboard extends Component {
    constructor(props){
        super(props);

        this.state = {
            user: null,
            authed: false,
            code: "--Please use single quotes for feature name and two quotes for value", isPaneOpen: false, isPaneOpenLeft: false,dataList: {},
            currentData: null, loading: true, analysis: {}, dataBind: null, alert: false, allData: {}, displayMenu: false, optoins: {},
            optionData: {}, Dcolumns: [], DRows: [], sqlData: [], tempRows: [], finalSQL: [], isOpened: false, isLoaded: false,
            wrongTable: false, sqlCols: [], sqlRows: [], axisX: '', axisY: '', selectedLine: '', data_name: '', 
            charts: [
                'line',
                'bar',
                'areaChart',
                'pieChart',
                'scatterPlot'
            ],
            xaxis: [], yaxis: [], sline: [], showCharts: false, sqlX: [], sqlY: [], isClicked: false, tableCharts: [], graphSQL: [],
            typeData: [],
            featuresName: [], ErrorSQL: false, getEmail: '', dataName: '', largeFile: ''
        }
    }

    // make sure the user is register or logged in
    componentDidMount(){
        firebaseAuth().onAuthStateChanged(user => {
            if(user){
                this.setState({
                    authed: true,
                    user: user
                })
                base.syncState(`users/${user.uid}/dataList`, {
                    context: this,
                    state: 'dataList',
                    then: () => this.setState({
                        loading: false
                    })
                })
                // once we know the user is logged in, get the data
                base.fetch(`users/${user.uid}`, {
                    context: this,
                    asArray: true
                }).then((data) => {
                    const full_data = data[0]
                    delete full_data.key
                    this.setState({
                        allData: full_data,
                        isLoaded: true
                    })
                }).catch(err => {
                    
                })
                this.setState({getEmail: user.email})
            }else{
                this.setState({
                    user: null,
                    authed: false
                })
            }
        })
        Modal.setAppElement(this.el);
    }

    shuffle = (array) =>{
        let counter = array.length;
        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(Math.random() * counter);
            // Decrease counter by 1
            counter--;
            // And swap the last element with it
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
    
        return array;
    }

    /* ====================Add, removing, upload, etc. ===================
       This is where we handle the main of this project
    */
   // add data
   addData = (analysis) => {
       const dataList = {...this.state.dataList}
       const timestamp = Date.now()

       dataList[`analysis-${timestamp}`] = analysis
       this.setState({dataList})
   }

   // remove data
   removeData = (key) =>{
       const data_list = {...this.state.dataList}
       const {allData} = this.state;
       data_list[key] = null
       
       this.setState({dataList: data_list, currentData: null})
       this.getData(null)
    }

    // set current data
    setCurrentData = (key, download) =>{
        const preData = {...this.state.dataList}
        this.setState({dataList: preData})
        const name = preData[key].name

        this.setState({
            currentData: name
        })
        this.getData(key, download)
    }

    // get data
    getData = (key, download) =>{
        if(key === null){
            if(this.state.dataBind !== null){
                base.removeBinding(this.state.dataBind)
            }
            this.setState({analysis: {}})
        }else{
            const preData = {...this.state.dataList}
            this.setState({dataList: preData})
            const name = preData[key].name

            const data_name = this.state.dataName

            let binding = base.bindToState(`users/${this.state.user.uid}/analysis/${key}`, {
                context: this,
                state: 'analysis',
                asArray: true,
                then: () => {
                    download && this.downloadData()
                }
            })
            this.setState({dataBind: binding})
        }
    }

    // download data
    downloadData = () => {
        var encodedURI = encodeURI(`data:text/csv;charset=utf-8,${Papa.unparse(this.state.analysis, {header: true})}`)
        var link = document.createElement("a")
        link.setAttribute("href", encodedURI)
        link.setAttribute("download", `${this.state.currentData}-DataAnalysis-${moment().format()}`)
        document.body.appendChild(link)
        link.click()
    }

    // upload csv data
    uploadCSV = (key, csv) => {
        const preData = {...this.state.dataList}
        preData[key].loading = true
        this.setState({dataList: preData,})
        const name = preData[key].name
        this.setState({dataName: name})

        let tempData = {}
        let index = 0
        
        csv.map((data, i) => {
            let tempDataList = data
            if(i === 0){
                let toLowerList = []
                for(var j = 0; j < tempDataList.length; j++){
                    toLowerList.push(tempDataList[j].toLowerCase())
                }
                tempData['fields'] = tempDataList;
            }else{
                tempData[`name-${index}`] = tempDataList
                index++
            }
            return 0
        })
        
        base.post(`users/${this.state.user.uid}/analysis/${name}`, {
            data: tempData
            }).then(e => {
                const dataList = {...this.state.dataList}
                dataList[key].uploaded = true
                dataList[key].loading = false
                dataList[key].fields = tempData.fields
                dataList[key].data = tempData[name]
                this.setState({dataList, isLoaded: true})
            }).catch(err =>{
                console.error(err);
        })
    }

    // select data from option menu
    selectHandleChange = (e) => {
        e.preventDefault();

        const name = JSON.parse(e.target.value)
        const key = name.k
        if(key === null){
            console.log("its empty")
        }else{
            if(this.state.allData !== null){
                const {allData} = this.state;
                this.setState({nameData: key})
    
                if(key in allData){
                    const cols = allData[key].fields
                    const mCols = []
                    cols.map(x => {
                        mCols.push(x.split(' ').join('_'))
                    })
                    this.setState({Dcolumns: mCols, data_name: key})
    
                    const arr = []
                    Object.keys(allData[key]).slice(1).map((x)=> {
                        arr.push(allData[key][x]) 
                    })
    
                    this.setState({tempRows: arr})
                    this.setState({isOpened: true})

                    const newArray = []
                    Object.keys(allData[key]).map((x)=> {
                        newArray.push(allData[key][x]) 
                    })

                    var headers = newArray[0]
                    var data = []
                    for(var i = 1; i < newArray.length; i++){
                        var dataToInsert = {}
                        var values = newArray[i];

                        for(var x = 0; x < headers.length; x++){
                            var kx = headers[x];
                            dataToInsert[kx] = values[x]
                        }
                        data.push(dataToInsert)
                    }

                    this.setState({sqlData: data})
                    this.setState({featuresName: headers})
                    const mType = []
                    Object.values(data[0]).map(x => {
                        mType.push(typeof(x))
                    })
                    this.setState({typeData: mType})
                    

                }else{
                    console.log("no...")
                }
            }else{
                console.log("Empty data")
            }
        }
        
    }

    // handle handle table - based on sql query
    handelSQLTable = () => {
        const {sqlData} = this.state;
        const {code} = this.state;
        const query = code
    
        const sqlQuery = query
        var name = this.state.nameData;

        name = sqlData;
        const word = `${this.state.nameData}`
        if(sqlQuery.includes(word)){
            const stripped = sqlQuery.replace(/from/g, 'from ?').replace(/'/g, "`");
            alasql.promise(stripped, [name]).then((res) =>{
                var sCols = []
                Object.keys(res[0]).map(columnName => {
                    sCols.push(columnName)
                })
                this.setState({sqlCols: sCols})
    
                var sRows = res.map(Object.values);
                this.setState({sqlRows: sRows})                
                this.setState({
                    finalSQL: res,
                    showCharts: true,
                    tableCharts: [this.state.sqlCols, this.state.sqlRows]
                })
    
                var objectArr = [];
                sRows.map(r => {
                    let obj = {};
                    r.map((r, i) => {
                        obj[sCols[i]] = r;
                    });
                    objectArr.push(obj);
                });
    
                var x_axis = this.state.finalSQL.map(Object.keys)
                this.setState({sqlX: x_axis[0]})
    
                // y-axis - first we need to shuffle the array
                const y_axis = this.state.finalSQL.map(Object.keys)
                this.shuffle(y_axis)
                this.setState({
                    sqlX: y_axis[0],
                    graphSQL: objectArr
                })
    
            }).catch((err) =>{

                this.setState({ErrorSQL: true})
            })
            this.setState({ErrorSQL: false})

        }else{
            console.log("Can't find data name, are you sure that you are not using ", word, " data")
        }
    }

    handleChart = (e) => {
        e.preventDefault();
        const { name, value } = e.target;

        this.setState({
            [name]: value
        });
    }


    handleSQLChange = (newCode) =>{
        this.setState({
            code: newCode
        })
    }

    handleFeatureType(feature){
        if(feature.length > 0){
            return feature.map((mType, index) => (
                <span 
                    className="ml-2 pl-0 text-xs text-grey-dark font-bold font-consolas text-grey-darkest px-3 py-1 text-xs italic tracking-wide"
                    key={index}>{mType}</span>
            ))
        }
    }

    toLower = (str) => {
        const toL = str.toLocaleLowerCase()
        if(str){
            return toL
        }else{
            return ''
        }
    }

  render() {
    const editorOption = {
        lineNumber: true,
        mode: 'text/x-sql',
        keymap: 'sublime'
    } 
    const {axisX, axisY, selectedLine, graphSQL} = this.state;
    const cols = {[`${axisX}`]: {alias: `${axisX}`}, [`${axisY}`]: {alias: `${axisY}`}}
    return this.state.loading ? (
        <div> 
            <h1 style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)'}}>Complete 100%...</h1>
        </div>
        ) :(
            <div className="bg-lighter font-sans antialias text-grey-darkest">
                <div className="bg-blue-data-dark mb-0 shadow z-1 ">
                    <div className="container px-1 move-life">
                        <div className="flex items-center py-2 px-1">
                            <div className="w-1/2 flex items-center">
                                <div className="logo-container w-left j-here text-white">
                                    <h3>Data Analysis</h3>
                                </div>
                                <div className="w-3/5 mg-left-here">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="h-8 p-4 text-sm w-search-full border" 
                                            placeholder="Search inside your data, such are table name" />
                                        <span className="flex items-center bg-grey-lightest hover:bg-grey-lighter absolute pin-r pin-y border px-8 mg-right-search">
                                            <svg className="fill current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/></svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            <div className="three-columns flex">
                <div className="left-sidebar wside-left border-r-2 border-solid border-grey-light min-h-screen pt-4">
                    <ul className="list-reset text-sm border-b-2 border-grey-light">
                        <li className="flex items-center py-2 pl-4 bg-white border-l-4 border-blue">
                            <div className="pr-2 tc-blue-data fix-negative-margin">
                                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M13 20v-5h-2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7.59l-.3.3a1 1 0 1 1-1.4-1.42l9-9a1 1 0 0 1 1.4 0l9 9a1 1 0 0 1-1.4 1.42l-.3-.3V20a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zm5 0v-9.59l-6-6-6 6V20h3v-5c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v5h3z"/></svg>                        </div>
                            <a href="#" className="text-grey-darker hover:text-black">Dashboard</a>
                        </li>
                        <li className="flex items-center py-2 pl-4">
                            <div className="pr-2 text-blue-data">
                                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM5.68 7.1A7.96 7.96 0 0 0 4.06 11H5a1 1 0 0 1 0 2h-.94a7.95 7.95 0 0 0 1.32 3.5A9.96 9.96 0 0 1 11 14.05V9a1 1 0 0 1 2 0v5.05a9.96 9.96 0 0 1 5.62 2.45 7.95 7.95 0 0 0 1.32-3.5H19a1 1 0 0 1 0-2h.94a7.96 7.96 0 0 0-1.62-3.9l-.66.66a1 1 0 1 1-1.42-1.42l.67-.66A7.96 7.96 0 0 0 13 4.06V5a1 1 0 0 1-2 0v-.94c-1.46.18-2.8.76-3.9 1.62l.66.66a1 1 0 0 1-1.42 1.42l-.66-.67zM6.71 18a7.97 7.97 0 0 0 10.58 0 7.97 7.97 0 0 0-10.58 0z"/></svg>
                            </div>
                            <a href="#" className="text-grey-darker hover:text-black">Profile</a>
                        </li>
                        {this.state.authed ? (
                        <li className="flex items-center py-2 pl-4">
                            <div className="pr-2 text-blue-data">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M9.41,11H21c0.553,0,1,0.448,1,1c0,0.553-0.447,1-1,1H9.41l3.3,3.3c0.356,0.422,0.304,1.054-0.118,1.409
                                c-0.377,0.318-0.93,0.314-1.302-0.009l-5-5c-0.382-0.389-0.382-1.011,0-1.4l5-5c0.417-0.362,1.048-0.318,1.411,0.099
                                c0.323,0.373,0.327,0.925,0.009,1.302L9.41,11z M7,3c0.553,0,1,0.448,1,1S7.553,5,7,5H4v14h3c0.553,0,1,0.447,1,1s-0.447,1-1,1H4
                                c-1.104,0-2-0.896-2-2V5c0-1.104,0.896-2,2-2H7z"/>
                                </svg>                        
                            </div>

                            <a href="#" className="text-grey-darker hover:text-black" onClick={() => logout()}>Logout</a>
                            
                        </li>
                        ): null }
                    </ul>
                </div>

                <div className="middle-column w-3/5 flex-1">
                    <div className="breadcrumbs text-sm px-2 py-2 border-2 border-grey-light mb-5">
                        <span className="px-2"><b>Welcome</b></span>
                            <span>  
                                <svg width="6px" height="10px" viewBox="0 0 6 10" version="1.1" xmlns="http://www.w3.org/2000/svg" >
                                    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                    <g transform="translate(-311.000000, -90.000000)" fill="#82909E" fillRule="nonzero">
                                        <path d="M317.292893,92.2928932 C317.683418,91.9023689 318.316582,91.9023689 318.707107,92.2928932 C319.097631,92.6834175 319.097631,93.3165825 318.707107,93.7071068 L314.707107,97.7071068 C314.316582,98.0976311 313.683418,98.0976311 313.292893,97.7071068 L309.292893,93.7071068 C308.902369,93.3165825 308.902369,92.6834175 309.292893,92.2928932 C309.683418,91.9023689 310.316582,91.9023689 310.707107,92.2928932 L314,95.5857864 L317.292893,92.2928932 Z" transform="translate(314.000000, 95.000000) rotate(-90.000000) translate(-314.000000, -95.000000) "></path>
                                    </g>
                                    </g>
                                </svg>
                            </span>
                        <span className="px-2">{this.state.getEmail}</span>
                    </div>

                    <div className="px-5 container-data mx-auto">
                        <div className="heading-section flex items-center mb-1 mb-4">
                            <div className="pr-2 text-blue-data">
                                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M13 20v-5h-2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7.59l-.3.3a1 1 0 1 1-1.4-1.42l9-9a1 1 0 0 1 1.4 0l9 9a1 1 0 0 1-1.4 1.42l-.3-.3V20a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zm5 0v-9.59l-6-6-6 6V20h3v-5c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v5h3z"/></svg>
                            </div>
                            {this.state.allData ? (
                                <h3 className="font-normal text-3xl mr-2">{this.state.data_name}</h3>
                            ): null}
                            <div className="rounded-full font-bold bg-blue-data-dark text-white px-3 py-1 text-xs uppercase tracking-wide">
                                Active
                            </div>
                        </div>
                        {this.state.isOpened ? (
                            <React.Fragment>
                                <div className="text-sm text-grey-darker mb-4">{this.state.tempRows.length} rows | {this.state.Dcolumns.length} columns</div>
                               
                                <React.Fragment>
                                    <CodeMirror 
                                        value={this.state.code}
                                        onChange={this.handleSQLChange}
                                        options={editorOption}
                                        className="border-t-blue-data border border-grey-light border-t-4 rounded px-2 py-2 mb-1"/>
                                    
                                    <div className="text-left py-2">
                                        <button onClick={this.handelSQLTable} type="submit" className="btn-run text-white text-sm rounded font-bold px-2 py-2 hover:btn-run-hover">Run Query</button>
                                    </div>
                                    {this.state.ErrorSQL && (
                                        <React.Fragment>
                                            <div className="hideMe text-red">
                                                <h4>Unable to process the query - use lowercase query</h4>
                                            </div>
                                            <ToastContainer/>
                                        </React.Fragment>
                                    )}
                                    
                                </React.Fragment>
                            </React.Fragment>
                        ): (
                            <div className="table-details border-t-blue-data border border-grey-light border-t-4 rounded px-2 py-2 mb-1">
                                <h4 style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)'}}>Please choose or <a href="#" onClick={() => this.setState({isPaneOpen: true})}>upload</a> your name on the left-side bar.</h4>
                            </div>
                        )}
                        {/*this.state.ErrorSQL && (
                            <React.Fragment>
                                <div className="text-left py-2">
                                    <button onClick={this.notify} type="submit" className="btn-run text-white text-sm rounded font-bold px-2 py-2 hover:btn-run-hover">Run Query</button>
                                </div>
                                <ToastContainer/>
                            </React.Fragment>
                        )*/}

                        <p className="font-normal text-strong uppercase tracking-wide text-1xl mr-2 mb-1">Table</p>
                        <div className="border-t-blue-data table-details bg-white border border-grey-light border-t-4 rounded px-2 py-2 mb-3" type="text">
                            {this.state.isOpened ? (
                                this.state.finalSQL && 
                                    <React.Fragment>
                                        <table className="tablew">
                                            <tbody style={{ display: 'block', border: '1px solid green', height: '405px', overflowY: 'scroll'}}>
                                                <tr>
                                                    {this.state.sqlCols.map(x => (
                                                        <th key={v4()}>{x}</th>
                                                    ))}
                                                </tr>
                                                {this.state.sqlRows.map((key) => (
                                                    <tr key={v4()}>{key.map(x =>(
                                                        <td key={v4()}>{x}</td>
                                                    ))}</tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </React.Fragment>
                            ): null}
                        </div>
                        <p className="font-normal text-strong uppercase tracking-wide text-1xl mr-2 mb-1">Charts</p>
                        <div className="chart-details bg-white border border-grey-light border-solid border-t-4 border-t-blue-data rounded px-4 py-6 mb-8">
                            <div className="flex">
                                {this.state.showCharts ? (
                                    <React.Fragment>
                                        <div className="w-1/3 pr-4">
                                            <h2 className="text-lg font-semibold mb-4">Choose chart type / features</h2>
                                            <span>Chart type </span>
                                            <div className="inline-block relative w-44 pb-2">
                                                <select 
                                                    className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                                    name="selectedLine" value={ selectedLine }  onChange={this.handleChart}>
                                                    <option>-----</option>
                                                    {this.state.charts.map((k, v) => (
                                                        <option name="line" key={k} value={k}>{k}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                            <br/>
                                            <span>X axis </span>
                                            <div className="inline-block relative w-44 pb-2 pl-9" style={{marginLeft: '35px'}}>
                                                <select 
                                                    className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                                    name="axisX" value={axisX} onChange={this.handleChart}>
                                                    <option>-----</option>
                                                    {this.state.sqlCols.map((k, v) => (
                                                        <option name="xaxis" key={k} value={k}>{k}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                            <br/>
                                            <span>Y axis </span>
                                            <div className="inline-block relative w-44" style={{marginLeft: '35px'}}>
                                                <select 
                                                    className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                                    name="axisY" value={axisY} onChange={this.handleChart}>
                                                    <option>-----</option>
                                                    {this.state.sqlCols.map((k, v) => (
                                                        <option name="yaxis" key={k} value={k}>{k}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-2/3 pl-2">
                                            {selectedLine === 'line' && axisX.length > 0 && axisY.length > 0 ? (
                                                <div>
                                                    <Chart height={350} data={graphSQL} scale={cols} forceFit>
                                                    <Axis name={`${axisX}`} />
                                                    <Axis name={`${axisY}`} />
                                                    <Tooltip crosshairs={{type : "y"}}/>
                                                    <Geom type="line" position={`${axisX}*${axisY}`} size={2} />
                                                    <Geom type='point' position={`${axisX}*${axisY}`} size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1}} />
                                                    </Chart>
                                                </div>
                                            ) : null}
                                            {selectedLine === 'bar' && axisX.length > 0 && axisY.length > 0 ? (
                                                <div>
                                                    <Chart height={400} data={graphSQL} scale={cols} forceFit>
                                                        <Axis name={`${axisX}`} />
                                                        <Axis name={`${axisY}`} />
                                                        <Tooltip crosshairs={{type : "y"}}/>
                                                        <Geom type="interval" position={`${axisX}*${axisY}`} />
                                                    </Chart>
                                                </div>
                                            ) : null}
                                            {selectedLine === 'areaChart' && axisX.length > 0 && axisY.length > 0 ? (
                                                <div>
                                                    <Chart height={400} data={graphSQL} scale={cols} forceFit>
                                                    <Axis name={`${axisX}`} />
                                                    <Axis name={`${axisY}`} label={{
                                                    formatter: val => {
                                                        return (val / 10000).toFixed(1) + 'k';
                                                    }
                                                    }} />
                                                    <Tooltip crosshairs={{type:'line'}}/>
                                                    <Geom type="area" position={`${axisX}*${axisY}`} />
                                                    <Geom type="line" position={`${axisX}*${axisY}`} size={2} />
                                                    </Chart>
                                                </div>
                                            ): null}
                                            {selectedLine === 'pieChart' && axisX.length > 0 && axisY.length > 0 ? (
                                                <div>
                                                    <p>Ops, we'll be implementing this graph soon. Come by later.</p>
                                                </div>
                                            ): null}
                                            {selectedLine === 'scatterPlot' && axisX.length > 0 && axisY.length > 0 ? (
                                                <div>
                                                    <p>Ops, we'll be implementing this graph soon. Come by later.</p>
                                                </div>
                                            ): null}
                                            
                                            </div>
                                    </React.Fragment>
                                ): null}
                            </div>
                            
                        </div>
                    </div> 
                </div>

                <div className="right-sidebar w-right bg-white shadow">
                    <div className="flex items-center justify-between p-4 mb-2">
                        <div className="inline-block relative w-44">
                            {this.state.allData ? (
                                <React.Fragment>
                                    <select onChange={this.selectHandleChange} className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                        <React.Fragment>
                                            <option disabled="disabled" selected="selected">-Choose data---</option>
                                            {this.state.allData && (
                                                Object.keys(this.state.allData).map((k, v) => (
                                                    <option key={k} value={JSON.stringify({k, value: v.value})}>{k}</option>
                                                ))
                                            )}
                                        </React.Fragment>
                                    </select>
                                    <div className="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </React.Fragment>
                            ):null}
                        </div>
                        <div ref={ref => this.el = ref}>
                            <button 
                                className="bg-white uppercase text-bold text-grey-darkest text-xs font-bold tracking-wide rounded border border-solid border-grey-light px-3 py-2 hover:text-white hover:bg-grey-darkest"
                                onClick={() => this.setState({isPaneOpen: true})}>
                                +Data
                            </button>
                            <SlidingPane
                                className='some-custom-class'
                                overlayClassName='some-custom-overlay-class'
                                isOpen={ this.state.isPaneOpen }
                                title='Please, upload your data. Only csv accepting csv...'
                                subtitle='Upload csv file.'
                                width='570px'
                                onRequestClose={ () => {
                                    // triggered on "<" on left top click or on outside click
                                    this.setState({ isPaneOpen: false });
                                    
                                } }>
                                <div>
                                    {Object.keys(this.state.dataList).map((name) => {
                                        return <DataApp 
                                            race={this.state.dataList[name]} key={name} index={name}
                                            removeData={this.removeData} setCurrentData={this.setCurrentData}
                                            uploadDataCsv={this.uploadCSV} currentData={this.state.currentData}
                                            reloadAfterCSV={this.reLoad}/>
                                    })}

                                    <AddData addData={this.addData} fileSize={this.state.largeFile}/>
                                </div> 
                                <div class="bg-orange-lightest border-l-4 border-orange text-orange-dark p-4" role="alert">
                                    <p>After uploading data - refresh the  homepage.</p>
                                </div>
                                                               
                            </SlidingPane>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold border-b border-solid border-grey-light px-4 mb-4">
                        <div className="text-grey-darkest border-b-4 border-solid border-blue-data pb-4">Features</div>
                    </div>

                    <div className="flex px-4 mb-4">
                        <div className="text-blue-resolute-icon mr-2">
                            <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path className="heroicon-ui" d="M6.3 12.3l10-10a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-.7.3H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 .3-.7zM8 16h2.59l9-9L17 4.41l-9 9V16zm10-2a1 1 0 0 1 2 0v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h6a1 1 0 0 1 0 2H4v14h14v-6z"/></svg>
                        </div>
                        <div className="mb-2">
                            <div className="text-sm text-grey-darkest leading-normal mb-2">
                            {this.state.allData && (
                                this.state.featuresName && (
                                    this.state.featuresName.map((x, v) => (
                                        <div key={v4()} className="text-sm text-grey-darkest leading-normal mb-2">{this.toLower(x)}
                                        </div>
                                    ))
                                )
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
        );
  }
}

export default Dashboard;
