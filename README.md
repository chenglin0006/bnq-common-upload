## Install

```
npm i bnq-common-upload

```

##use

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
