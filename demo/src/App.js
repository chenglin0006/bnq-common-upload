import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CommonComponent from '../../src/index'

class App extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
    }

    refreshList(list,id){
        console.log(list);
    }

    componentDidMount(){
    }

  render() {
      let arry = ['http://res1.bnq.com.cn/003f1937-60b9-440b-b29b-4e152e235a25?t=1537261779453']
      let fileList = [];
      arry.forEach((ele,index)=>{
          let obj = {
              url:ele,
              uid:index
          }
          if(obj.url){
              fileList.push(obj)
          }
      })
      fileList=[{
          flag: 0,
          height: 1400,
          uid: 0,
          url: "http://res1.bnq.com.cn/7a8fb77c-1c1c-449f-94d0-45d6778c88db?t=1538124888518",
          width: 1438
      }]
      const props={
            disabled: true,   //是否可点
            id: 'test',       //用来标识该组件，一个页面上可以有多个上传图片组件
            className: 'test',   //可以定制样式
            fileList:fileList,      //用来存放上传的图片列表
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
