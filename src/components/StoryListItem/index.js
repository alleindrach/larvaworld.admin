import React, { Component } from 'react';
import Audio from 'react-audioplayer';
import { connect } from 'dva';
import { Icon, Form, Input, List } from 'antd';

const {
  Item: { Meta },
} = List;
const { TextArea } = Input;
// import styles from './index.less';

@connect(({ slides, loading }) => ({
  slides,
  loading: loading.models.slides,
}))
@Form.create()
class StoryListItem extends Component {
  // class EditableSoundChannelCard extends Component {
  audioComponent = null;

  commentComponent = null;

  onReject = () => {
    const { form, dispatch, data } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      dispatch({
        type: 'slides/audit',
        payload: {
          data: [
            {
              id: data.id,
              comment: fieldsValue.comment,
              audit: false,
            },
          ],
        },
      });
      // handleImport(fieldsValue);
    });
  };

  onApprove = () => {
    const { form, dispatch, data } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      dispatch({
        type: 'slides/audit',
        payload: {
          data: [
            {
              id: data.id,
              comment: fieldsValue.comment,
              audit: true,
            },
          ],
        },
      });
      // handleImport(fieldsValue);
    });
  };

  render() {
    const { data, loading, fullPlayer, form } = this.props;

    return (
      <List.Item
        key={data.id}
        actions={[
          <Icon type="check" onClick={this.onApprove} />,
          <Icon type="close" onClick={this.onReject} />,
        ]}
        // extra={
        //   <img
        //     width={272}
        //     alt="logo"
        //     src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
        //   />
        // }
      >
        <Meta title={data.name} description={data.desc} />
        <Audio
          loading={loading}
          width={600}
          height={300}
          playlist={data.scenes}
          fullPlayer={fullPlayer || true}
          // store a reference of the audio component
          ref={audioComponent => {
            this.audioComponent = audioComponent;
          }}
        />
        <Form layout="horizontal">
          <Form.Item>
            {form.getFieldDecorator('comment', {
              rules: [{ required: false, message: '请输入意见！' }],
              initialValue: data.comment,
            })(
              <TextArea
                id="comment"
                rows={4}
                ref={commentComponent => {
                  this.commentComponent = commentComponent;
                }}
                value={data.comment ? data.comment : ''}
                onPressEnter={this.onApprove}
              />
            )}
          </Form.Item>
        </Form>
      </List.Item>
    );
  }
}

export default StoryListItem;
