import {shallow,mount} from 'enzyme';
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CommonComponent from '../src/index'
Enzyme.configure({ adapter: new Adapter() });
import renderer from 'react-test-renderer';

test('filter', () => {
    const props = {
        // Jest 提供的mock 函数
        disabled: true,   //是否可点
        id: 'test',       //用来标识该组件，一个页面上可以有多个上传图片组件
        className: 'test',   //可以定制样式
        imgDesc:'图片说明',       //上传图片的格式说明
        isUploadDefine:true,  //是否是自定义的照片墙
        showPicListDealDiv:true,
        refreshList:(list)=>{
            console.log(list,'===');
        },
        fileSizeLimit:3,
        uploadImgLimitNumber:10, //可上传图片张数
        fileList:[
            {url:'http://res1.bnq.com.cn/003f1937-60b9-440b-b29b-4e152e235a25?t=1537261779453',uid:0},
            {url:'http://res1.bnq.com.cn/d1d85701-e7ff-471f-89d2-4a23960845ec?t=1537264755200',uid:2}
        ]
    }

    const component = renderer.create(
        <CommonComponent {...props}>Facebook</CommonComponent>,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    const filterWrapperTest = mount(<CommonComponent {...props} />);
    filterWrapperTest.find('.ant-upload button.ant-btn').simulate('click');

    //测试初始化数据
    expect(filterWrapperTest.find('.img-item').length).toBe(props.fileList.length)

    //测试前移
    filterWrapperTest.find('.buttons-div').at(1).childAt(0).simulate('click');
    // console.log(filterWrapperTest.find('.img-item img').at(0).debug(),'====');
    expect(filterWrapperTest.find('.img-item img').at(0).debug().indexOf('http://res1.bnq.com.cn/d1d85701-e7ff-471f-89d2-4a23960845ec?t=1537264755200')).toBeGreaterThan(-1);
    expect(filterWrapperTest.find('.img-item img').at(0).debug().indexOf('http://res1.bnq.com.cn/d1d85701-e7ff-471f-89d2-4a23960845ec?t=1537264755200')).not.toBe(-1);

    //测试后移
    filterWrapperTest.find('.buttons-div').at(1).childAt(0).simulate('click');
    expect(filterWrapperTest.find('.img-item img').at(0).debug().indexOf('http://res1.bnq.com.cn/003f1937-60b9-440b-b29b-4e152e235a25?t=1537261779453')).toBeGreaterThan(-1)
});
