import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CommonComponent from '../../src/index'
import Fetch from './fetch'
import * as Qiniu from 'qiniu-js';
import {message} from 'antd';

var uploadImgList = [];//上传图片的key和order顺序排序
var uploadImgTimes = 0;//记录顺序

const uuid=()=> {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

class App extends Component {
    constructor(props) {
        super(props);
        this.testClick = this.testClick.bind(this);
        this.getQiniuToken = this.getQiniuToken.bind(this);
        this.QiniuCallBack = this.QiniuCallBack.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.state = {
            fileList: []
        }

    }
    testClick(){
        console.log('123123');
    }

     getQiniuToken(e, callBack, id, fileSizeLimit) {
         message.info('上传图片中');
        let file = e.file;
        let key = uuid();
        let obj = {
            key:key,
            uploadOrder:uploadImgTimes
        }
        Fetch({
            url: 'http://xres.bnq.com.cn/file/upload/getQiniuTokenWithParams',
            type: 'GET',
            isQiniu: 'true'
        }).then((res) => {
            if (res.response.code === 0) {
                let token = res.response.data.upToken;
                if(fileSizeLimit&&file.size>fileSizeLimit*1048576){
                    message.error('支持'+fileSizeLimit+'M以内图片');
                    return
                }
                let putExtra = {
                    fname: "",
                    params: {},
                    mimeType: ["image/png", "image/jpeg", "image/jpg"]
                };
                let observer = {
                    next(res) {
                        let total = res.total;
                    },
                    error(err) {
                        if (err && err.isRequestError) {
                            switch (err.code) {
                                case 614:
                                    message.error('该图片已经存在!');
                                    break;
                                default:
                                    message.error(err.message);
                            }
                        } else {
                            message.error('支持jpg、.png、.jpeg格式!');
                        }
                    },
                    complete(res) {
                        res.id = id;
                        res.fileName = file.name;
                        uploadImgList.forEach((ele)=>{
                            if(ele.key == res.key){
                                res.uploadOrder = ele.uploadOrder;
                            }
                        })
                        callBack && callBack(res)
                    }
                }
                //调用sdk上传接口获得相应的observable，控制上传和暂停
                let observable = Qiniu.upload(file, key, token, putExtra);
                let subscription = observable.subscribe(observer);
            }
        })
    }

    QiniuCallBack(res){
        let timeStamp=new Date().getTime();
        let list = this.state.fileList || [];
        list.push({
            flag:timeStamp,
            uid: timeStamp,
            name: res.key,
            width:res.w,
            height:res.h,
            uploadOrder:res.uploadOrder,//用来记录上传图片的顺序
            status: 'done',
            url: 'http://res1.bnq.com.cn/' + res.key + '?t=' + timeStamp,
        });
        this.setState({fileList:list});
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
            getQiniuToken:this.getQiniuToken,   //七牛上传func
            QiniuCallBack:this.QiniuCallBack,   //上传后图片处理func
            imgDesc:'test',       //上传图片的格式说明
            isUploadDefine:true,  //是否是自定义的照片墙
            showPicListDealDiv:false,
            refreshList:this.refreshList,   //删除图片方法
            uploadImgLimitNumber:3 //可上传图片张数
        }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
          <CommonComponent {...props}></CommonComponent>
      </div>
    );
  }
}

export default App;
