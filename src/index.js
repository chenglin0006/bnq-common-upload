/*
*
* */
import React, {Component} from 'react';
import {Upload, Icon, Modal, Button,message} from 'antd';
import './index.less';
import PropTypes from "prop-types";
import Fetch from './fetch'
import * as Qiniu from 'qiniu-js';

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

//数组交换顺序 用于元素的前移或者后移
const swapItems = (arr,index1,index2)=>{
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
}

export default class PicturesWall extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            previewVisible: false,
            previewImage: '',
            stateFileList:this.props.fileList || [],
            uploadImgList:[],
            uploadImgTimes:0
        };
        this._handlePreview = this._handlePreview.bind(this);
        this._handleCancel = this._handleCancel.bind(this);
        this._removeImgFun = this._removeImgFun.bind(this);
        this._sortImgFun = this._sortImgFun.bind(this);
        this._getQiniuToken = this._getQiniuToken.bind(this);
        this._qiniuCallBack = this._qiniuCallBack.bind(this);
    }

    _handleCancel() {
        this.setState({previewVisible: false});
    }

    _handlePreview(file) {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }

    _removeImgFun(uid){
        let list  = this.state.stateFileList;
        list.forEach((item,index)=>{
            if(item.uid === uid){
                list.splice(index,1);
            }
        })
        this.setState({stateFileList:list});
        this.props.refreshList(list,this.props.id);
    }

    _sortImgFun(index,type){
        let list  = this.state.stateFileList;
        if (type == 'pre') {
            if (index == 0) {
                return;
            }
            list = swapItems(list, index, index - 1);
        } else {
            if (index == list.length - 1) {
                return;
            }
            list = swapItems(list, index, index + 1);
        }
        this.setState({stateFileList:list});
        this.props.refreshList(list,this.props.id);
    }

    renderPicList(data){
        const {showPicListDealDiv=true}=this.props;
        return(
            data&&data.map((ele,i)=>{
                return (
                    <div className='img-item' key={i}>
                        <img src={ele.url} style={{cursor:'pointer'}} onClick={()=>{this._handlePreview(ele)}}/>
                        <div className='buttons-div'>
                            {showPicListDealDiv?<Button size='small' onClick={()=>{this._sortImgFun(i,'pre')}}>前移</Button>:""}
                            {showPicListDealDiv?<Button size='small' onClick={()=>{this._sortImgFun(i,'next')}}>后移</Button>:""}
                            <Button size='small' onClick={()=>{
                                this._removeImgFun(ele.uid,this.props.id)
                            }}>删除</Button>
                        </div>
                    </div>
                )
            })
        )
    }

    _getQiniuToken(e,id,fileSizeLimit){
        message.info('上传图片中');
        let file = e.file;
        let key = uuid();
        if(fileSizeLimit&&file.size>fileSizeLimit*1048576){
            message.error('支持'+fileSizeLimit+'M以内图片');
            return
        }
        let  url = this.props.QiniuTokenUrl || 'http://xres.bnq.com.cn/file/upload/getQiniuTokenWithParams';
        Fetch({
            url: url,
            type: 'GET',
            isQiniu: 'true'
        }).then((res) => {
            if (res.response.code === 0) {
                let obj = {
                    key:key,
                    uploadOrder:this.state.uploadImgTimes
                }
                console.log(obj,'====')
                let imgList = this.state.uploadImgList || [];
                let times = this.state.uploadImgTimes;
                times++;
                imgList.push(obj);
                this.setState({uploadImgList:imgList,uploadImgTimes:times},()=>{
                    let token = res.response.data.upToken;
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
                        complete:(res)=> {
                            res.id = id;
                            res.fileName = file.name;
                            this.state.uploadImgList.forEach((ele)=>{
                                if(ele.key == res.key){
                                    res.uploadOrder = ele.uploadOrder;
                                }
                            })
                            this._qiniuCallBack(res)
                        }
                    }
                    //调用sdk上传接口获得相应的observable，控制上传和暂停
                    let observable = Qiniu.upload(file, key, token, putExtra);
                    let subscription = observable.subscribe(observer);
                });
            }
        })
    }

    _qiniuCallBack(res){
        if(this.state.stateFileList.length==this.props.uploadImgLimitNumber){
            let msg = `最多允许传${this.props.uploadImgLimitNumber}张图`;
            message.error(msg);
            return
        }
        let timeStamp=new Date().getTime();
        let list = this.state.stateFileList || [];
        if(this.props.uploadImgLimitNumber&&this.props.uploadImgLimitNumber>1 || !this.props.uploadImgLimitNumber&&this.props.uploadImgLimitNumber!=0){
            list.push({
                uid: uuid(),
                name: res.key,
                width:res.w,
                height:res.h,
                uploadOrder:res.uploadOrder,//用来记录上传图片的顺序
                status: 'done',
                url: 'http://res1.bnq.com.cn/' + res.key + '?t=' + timeStamp,
            });
        } else {
            list = [{
                uid: -1,
                name: res.key,
                uploadOrder:res.uploadOrder,
                status: 'done',
                url: 'http://res1.bnq.com.cn/' + res.key + '?t=' + timeStamp,
            }]
        }

        //排序
        let rawList = [];
        let concatList = [];
        list.forEach((ele,index)=>{
            if(ele.uploadOrder || ele.uploadOrder==0){
                concatList.push(ele);
            } else {
                rawList.push(ele);
            }
        })
        concatList.sort(function(a,b){return a.uploadOrder-b.uploadOrder});
        list = rawList.concat(concatList);
        this.setState({stateFileList: list})
        this.props.refreshList(list,this.props.id);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            stateFileList: nextProps.fileList
        })
    }

    componentDidMount(){
        message.config({
            top: 100,
            duration: 2,
            maxCount: 1,
        });
    }

    render() {
        const {previewVisible, previewImage} = this.state;
        const {uploadImgLimitNumber,isUploadDefine,fileList,imgDesc} = this.props
        const uploadButton = (
            isUploadDefine?
                <Button>
                    <Icon type="upload" /> 点击上传
                </Button>:
                <div>
                    <Icon type="plus"/>
                    <div className="ant-upload-text">点击上传</div>
                </div>
        );
        let className = isUploadDefine?'clearfix define-upload-wall pic-list-div':'clearfix pic-list-div'
        className = className+' '+(this.props.className||'')
        return (
            <div className={className}>
                {isUploadDefine&&imgDesc?<span>
                        描述图片<span style={{color:'red'}}>（{imgDesc}）</span>
                    </span>:''}
                <Upload
                    multiple={!uploadImgLimitNumber||uploadImgLimitNumber&&uploadImgLimitNumber>1?true:false}
                    listType={isUploadDefine?'':"picture-card"}
                    onPreview={this._handlePreview}
                    onRemove={(e)=>this._removeImgFun(e.uid,this.props.id)}
                    fileList={this.state.stateFileList}
                    customRequest={(e) => {
                        this._getQiniuToken(
                            e,
                            this.props.id,
                            this.props.fileSizeLimit?this.props.fileSizeLimit:null
                        )
                    }}
                >
                    {this.state.stateFileList&&this.state.stateFileList.length >= uploadImgLimitNumber? null : uploadButton}
                </Upload>
                {!isUploadDefine && imgDesc?
                    <div style={{width:'700px',position: 'absolute',
                        bottom: '-25px'}}>
                        {imgDesc}
                    </div>:''}
                {isUploadDefine?<div className='img-list-div'>{this.renderPicList(this.state.stateFileList)}</div>:''}
                <Modal visible={previewVisible} footer={null} onCancel={this._handleCancel}>
                    <img alt="example" style={{width: '90%'}} src={previewImage}/>
                </Modal>
            </div>
        );
    }
}

PicturesWall.propTypes = {
    disabled: PropTypes.bool,   //是否可点
    id: PropTypes.string,       //用来标识该组件，一个页面上可以有多个上传图片组件
    className: PropTypes.string,   //可以定制样式
    fileList:PropTypes.array,      //用来存放上传的图片列表
    QiniuTokenUrl:PropTypes.string,   //七牛上传获取token url,有默认链接
    imgDesc:PropTypes.string,       //上传图片的说明
    isUploadDefine:PropTypes.bool,  //是否是自定义的照片墙
    showPicListDealDiv:PropTypes.bool,  //自定义的照片墙是否需要前移后移功能(默认需要)
    refreshList:PropTypes.func,   //图片列表刷新
    uploadImgLimitNumber:PropTypes.number, //可上传图片张数
    fileSizeLimit:PropTypes.number //图片大小控制，单位M
}

