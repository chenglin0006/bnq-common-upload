/*
*
* */
import React, {Component} from 'react';
import {Upload, Icon, Modal, Button} from 'antd';
import './index.less';
import PropTypes from "prop-types";

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
            stateFileList:this.props.fileList || []
        };
        this._handlePreview = this._handlePreview.bind(this);
        this._handleCancel = this._handleCancel.bind(this);
        // this._handleRemove = this._handleRemove.bind(this);
        this._removeImgFun = this._removeImgFun.bind(this);
        this._sortImgFun = this._sortImgFun.bind(this);
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

    _removeImgFun(flag){
        let list  = this.state.stateFileList;
        list.forEach((item,index)=>{
            if(item.flag === flag){
                list.splice(index,1);
            }
        })
        this.setState({stateFileList:list},()=>{
            this.props.refreshList(list);
        });
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
        this.setState({stateFileList:list},()=>{
            this.props.refreshList(list);
        });
    }

    renderPicList(data){
        return(
            data.map((ele,i)=>{
                return (
                    <div className='img-item' key={i}>
                        <img src={ele.url} style={{cursor:'pointer'}} onClick={()=>{this._handlePreview(ele)}}/>
                        <div className='buttons-div'>
                            {this.props.showPicListDealDiv?<Button size='small' onClick={()=>{this._sortImgFun(i,'pre')}}>前移</Button>:""}
                            {this.props.showPicListDealDiv?<Button size='small' onClick={()=>{this._sortImgFun(i,'next')}}>后移</Button>:""}
                            <Button size='small' onClick={()=>{
                                this._removeImgFun(ele.flag,this.props.id)
                            }}>删除</Button>
                        </div>
                    </div>
                )
            })
        )
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
                    onRemove={(e)=>this._removeImgFun(e.flag,this.props.id)}
                    fileList={fileList}
                    customRequest={(e) => {
                        this.props.getQiniuToken(
                            e,
                            this.props.QiniuCallBack,
                            this.props.id,
                            this.props.fileSizeLimit?this.props.fileSizeLimit:null
                        )
                    }}
                >
                    {fileList&&fileList.length >= uploadImgLimitNumber? null : uploadButton}
                </Upload>
                {!isUploadDefine && imgDesc?
                    <div style={{width:'700px',position: 'absolute',
                        bottom: '-25px'}}>
                        {imgDesc}
                    </div>:''}
                {isUploadDefine?<div className='img-list-div'>{this.renderPicList(fileList)}</div>:''}
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
    getQiniuToken:PropTypes.func,   //七牛上传func
    QiniuCallBack:PropTypes.func,   //上传后图片处理func
    imgDesc:PropTypes.string,       //上传图片的格式说明
    isUploadDefine:PropTypes.bool,  //是否是自定义的照片墙
    showPicListDealDiv:PropTypes.bool,  //是否需要前移后移功能
    refreshList:PropTypes.func,   //图片刷新
    uploadImgLimitNumber:PropTypes.number //可上传图片张数
}

