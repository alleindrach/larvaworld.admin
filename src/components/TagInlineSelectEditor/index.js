import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import EventEmitter from 'events';
// import styles from './index.less';

class TagInlineSelectEditor extends Component {
  static propTypes = {
    value: PropTypes.array,
    options: PropTypes.array,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    value: [],
    options: [],
    onChange: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || [],
    };
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.addListener('tagChanged', tags => {
      const { onChange } = this.props;
      onChange(tags);
    });
  }

  componentWillUnmount() {}

  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return { value: nextProps.value || [] };
    }
    return null;
  }

  onTagChanged = tags => {
    this.eventEmitter.emit('tagChanged', tags);
  };

  render() {
    const { value } = this.state;
    const lowcaseValue = value
      ? value.map(x => {
          return x.replace(/ROLE_(\w*)/, (m, p1) => {
            return p1.toLowerCase();
          });
        })
      : [];

    const { options } = this.props;
    return (
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Please select"
        defaultValue={lowcaseValue}
        onChange={this.onTagChanged}
      >
        {options}
      </Select>
    );
  }
}

export default TagInlineSelectEditor;
