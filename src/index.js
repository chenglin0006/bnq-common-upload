import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button} from 'antd'

import './index.less';

class CommonComponent extends Component {
    constructor(props) {
        super(props);
        this.testClick = this.testClick.bind(this);
    }

    testClick(){
        this.props.testClick()
    }

    render() {

        return (
            <Button className={'test'} onClick={this.testClick}>test</Button>
        );
    }
}

CommonComponent.propTypes = {

}

export default CommonComponent;
