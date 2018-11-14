import React, { Component } from 'react';
import Papa from 'papaparse';
import SkyLight from 'react-skylight';
import { runInThisContext } from 'vm';


class DataApp extends Component {
    constructor(props){
        super(props);

        this.state = {
            alert: false,
            uploaded: false,
            refresh: false,
            largeFile: false
        }
    }

    componentDidMount(){
        this.setState({refresh: true})
    }

    showAlert = () => {
        this.setState({
            alert: true
        })
    }

    refresh = () => {
        //this.setState({refresh: true})
        window.location.reload();
    }

    hideAlert = () => {
        this.setState({
            alert: false
        })
    }
    removeRace = () => {
        this.props.removeData(this.props.index)
    }
    
    setCurrentData = (e) => {
        if(e.target.tagName === 'SPAN'){
            this.props.setCurrentData(this.props.index)
        }else{
            this.props.setCurrentData(this.props.index, true)
        }
    }
    getAthletesForDownload = () => {
        this.props.getAthletesForDownload(this.props.index)
    }
    getCsvInput = () => {
        document.getElementById(`${this.props.index}-CSV`).click()
    }

    uploadCSV = (e) => {
        if (e.target.files[0]) {
            Papa.parse(e.target.files[0],
                {
                    delimiter: "",	// auto-detect
                    newline: "",	// auto-detect
                    quoteChar: '"',
                    header: false,
                    dynamicTyping: true,
                    preview: 0,
                    encoding: "",
                    worker: false,
                    comments: false,
                    step: undefined,
                    complete: (results,file) =>{
                        if(results.errors.length === 0){
                            this.props.uploadDataCsv(this.props.index, results.data)
                        }
                    },
                    error: undefined,
                    download: false,
                    skipEmptyLines: false,
                    chunk: undefined,
                    fastMode: undefined,
                    beforeFirstChunk: undefined,
                    withCredentials: undefined
                })
        }
        this.setState({uploaded: true})
    }



    render() {
        return (
            <div className="p-2 p-0 justify-center">
            <div className=" rounded overflow-hidden shadow-lg">
                <div className="px-6 py-4">
                <div className="flex items-center">
                    <div className="flex-1 text-grey-darker">
                    <div className="flex items-center">
                        <a onClick={this.setCurrentData}>
                            <span 
                                className="font-semibold text-grey-darker"
                                style={this.props.currentData === this.props.index ? {textDecoration:'underline'} :{}}>{this.props.race.name}</span>
                        </a>
                    </div> 
                    </div>
                    <div className="flex-1 text-right">
                        {this.props.race.uploaded 
                            ?<button onClick={this.setCurrentData} className="bg-green hover:bg-green-dark text-white font-bold py-2 px-2 rounded mr-3">
                                {this.props.race.loading ? 
                                    ('download'):'download'
                                }</button>
                        :<button onClick={this.getCsvInput} className="bg-grey hover:bg-grey-dark text-white font-bold py-2 px-4 rounded mr-3">
                            {this.props.race.loading ? 
                                ('upload'):'upload'
                            }</button>
                        }
                        
                        <button onClick={() => this.simpleDialog.show()} className="bg-red hover:bg-red-dark text-white font-bold py-2 px-2 rounded">delete</button>

                        <input style={{display: "none"}} type="file" accept=".csv" onChange={this.uploadCSV}
                               id={`${this.props.index}-CSV`}/>
                    </div>
                    <SkyLight hideOnOverlayClicked ref={ref => this.simpleDialog = ref} title="Do you want to delete?">
                        <div className="flex-1 text-right">
                            <button onClick={this.hideAlert} className="bg-green hover:bg-green-dark text-white font-bold py-2 px-4 rounded mr-3">No</button>
                            <button onClick={this.removeRace} className="bg-red hover:bg-red-dark text-white font-bold py-2 px-4 rounded">Yes</button>
                        </div>
                    </SkyLight>
                </div>
                </div>
            </div>
            </div>
        );
    }
}

export default DataApp;