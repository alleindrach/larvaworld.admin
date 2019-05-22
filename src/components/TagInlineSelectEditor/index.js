import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import EventEmitter from 'events';
// import styles from './index.less';

class TagInlineSelectEditor extends Component {
  static propTypes = {
    tags: PropTypes.array,
    options: PropTypes.array,
    onTagChanged: PropTypes.func,
  };

  static defaultProps = {
    tags: [],
    options: [],
    onTagChanged: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags || [],
    };
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.addListener('tagChanged', tags => {
      const { onTagChanged } = this.props;
      onTagChanged(tags);
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
    const { onTagChanged } = this.props;
    if (onTagChanged) {
      onTagChanged(tags);
    }
  };

  render() {
    const { tags } = this.state;
    const { options } = this.props;
    return (
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Please select"
        defaultValue={tags}
        onChange={this.onTagChanged}
      >
        {options}
      </Select>
    );
  }
}

export default TagInlineSelectEditor;
