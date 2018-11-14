import React, { Component } from 'react';

class AddData extends Component {
    constructor(props){
        super(props);

        this.state = {
            alert: false
        }
    }

    showAlert = () => {
        this.setState({
            alert: false
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        if(this.dataName.value === ''){
            this.showAlert();
        }else{
            this.props.addData({name: this.dataName.value.toLocaleLowerCase(), uploaded: false, loading: false})
            this.dataName.value = ''
            //this.data.blur()
        }
    }

    render() {
        return (
            <div>
                <div class="flex items-center justify-center pt-4 ">
                <form class="w-full max-w-sm" onSubmit={this.handleSubmit}>
                    <div class="flex items-center border-b-2 border-grey-light focus-within:border-blue py-2">
                    <input 
                        class="outline-none appearance-none bg-transparent border-none w-full text-grey-darker mr-3 py-1 px-2" 
                        type="text" placeholder="Name your data" aria-label="name" id="input-unique-id"
                        ref={(dataName) => this.dataName = dataName}/>
                    </div>
                </form>
                <button onClick={this.handleSubmit} class="flex-no-shrink bg-blue-data hover:bg-blue-data border-blue hover:border-blue-dark text-sm border-4 text-white py-1 px-2 rounded" type="button">
                    Upload Data
                </button>
                {this.state.alert ? 
                    (
                        <div class="bg-red-lightest border border-red-light text-red-dark px-4 py-3 rounded relative" role="alert">
                            <strong class="font-bold">Empty field!</strong>
                            <span class="block sm:inline">You cannot have an empty data field name</span>
                            <span class="absolute pin-t pin-b pin-r px-4 py-3">
                            <svg class="fill-current h-6 w-6 text-red" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </span>
                        </div>
                    ):null}
                </div>
            </div>
        );
    }
}

export default AddData;