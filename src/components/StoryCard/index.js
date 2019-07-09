import React, { Component } from 'react';
import Audio from 'react-audioplayer';
import { connect } from 'dva';
import { Card, Icon, Form, Input } from 'antd';

const { Meta } = Card;
const { TextArea } = Input;
// import styles from './index.less';

@connect(({ story, loading }) => ({
  story,
  loading: loading.models.stories,
}))
@Form.create()
class StoryCard extends Component {
  // class EditableSoundChannelCard extends Component {
  audioComponent = null;

  commentComponent = null;

  onReject = () => {
    const { form, dispatch, data } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      dispatch({
        type: 'story/audit',
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
        type: 'story/audit',
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
      <Card
        style={{ width: 300 }}
        cover={
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
        }
        actions={[
          <Icon type="check" onClick={this.onApprove} />,
          <Icon type="close" onClick={this.onReject} />,
        ]}
      >
        <Meta title={data.name} description={data.desc} />
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
      </Card>
    );
  }
}

export default StoryCard;