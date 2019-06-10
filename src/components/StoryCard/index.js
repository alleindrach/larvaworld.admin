import React, { Component } from 'react';
import Audio from 'react-audioplayer';
import { Form } from 'antd';
import { connect } from 'dva';
// import styles from './index.less';

@connect(({ story, loading }) => ({
  story,
  loading: loading.models.stories,
}))
@Form.create()
class StoryCard extends Component {
  // class EditableSoundChannelCard extends Component {
  audioComponent = null;

  onAudit = result => {
    const {
      data: { id },
      dispatch,
    } = this.props;
    dispatch({
      type: 'soundchannel/edit',
      payload: {
        id,
        audit: result,
      },
    });
  };

  render() {
    const { data, loading, fullPlayer } = this.props;

    return (
      <Audio
        loading={loading}
        width={600}
        height={300}
        playlist={data}
        fullPlayer={fullPlayer || true}
        // store a reference of the audio component
        ref={audioComponent => {
          this.audioComponent = audioComponent;
        }}
      />
    );
  }
}

export default StoryCard;
