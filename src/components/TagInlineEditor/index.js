import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tag, Icon, Input, Tooltip } from 'antd';
import EventEmitter from 'events';
// import styles from './index.less';

class TagInlineEditor extends Component {
  static propTypes = {
    tags: PropTypes.object,
    onChange: PropTypes.func,
    colorizer: PropTypes.any,
  };

  static defaultProps = {
    tags: [],
    onChange: undefined,
    colorizer: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      inputVisible: false,
      tags: props.tags || [],
      inputValue: '',
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

  onTagRemove = removedTag => {
    const { tags } = this.state;
    const newTags = tags.filter(tag => tag !== removedTag);
    console.log(newTags);
    this.setState({ tags: newTags });
    this.eventEmitter.emit('tagChanged', newTags);
    // const { onChange } = this.props;
    // if (onChange) {
    //   onChange(newTags);
    // }
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  onChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  onInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    console.log(tags);
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
    this.eventEmitter.emit('tagChanged', tags);
    // const { onChange } = this.props;
    // if (onChange) {
    //   onChange(tags);
    // }
  };

  saveInputRef = input => {
    this.input = input;
  };

  render() {
    const { value, inputVisible, inputValue } = this.state;
    const { colorizer } = this.props;
    return (
      <div>
        {value.map(tag => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag
              key={tag}
              closable
              onClose={() => this.onTagRemove(tag)}
              color={colorizer[tag] || 'black'}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.onChange}
            onBlur={this.onInputConfirm}
            onPressEnter={this.onInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
            <Icon type="plus" /> New Tag
          </Tag>
        )}
      </div>
    );
  }
}

export default TagInlineEditor;
