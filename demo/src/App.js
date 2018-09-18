import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CommonComponent from '../../src/index'

class App extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
        this.state = {
            fileList: []
        }

    }

    refreshList(list,id){
        this.setState({fileList:list});
    }

  render() {
        const props={
            disabled: true,   //是否可点
            id: 'test',       //用来标识该组件，一个页面上可以有多个上传图片组件
            className: 'test',   //可以定制样式
            fileList:this.state.fileList,      //用来存放上传的图片列表
            imgDesc:'图片说明',       //上传图片的格式说明
            isUploadDefine:true,  //是否是自定义的照片墙
            showPicListDealDiv:true,
            refreshList:this.refreshList,
            fileSizeLimit:3,
            uploadImgLimitNumber:10 //可上传图片张数
        }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
          <CommonComponent {...props}></CommonComponent>
      </div>
    );
  }
}

export default App;
