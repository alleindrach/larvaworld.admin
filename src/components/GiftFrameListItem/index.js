import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, Form, List, message, InputNumber, Button, Upload } from 'antd';
import IDImage from '@/components/IDImage';
import styles from './index.less';

const { Dragger } = Upload;

const {
  Item: { Meta },
} = List;
// import styles from './index.less';

@connect(({ frame, loading }) => ({
  frame,
  loading: loading.models.frame,
}))
@Form.create()
class GiftFrameListItem extends Component {
  // class EditableSoundChannelCard extends Component {
  audioComponent = null;

  commentComponent = null;

  onSave = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      dispatch({
        type: 'frame/update',
        payload: {
          ...fieldsValue,
        },
      });
    });
  };

  onDelete = () => {
    const {
      data: { id },
      dispatch,
    } = this.props;
    dispatch({
      type: 'frame/delete',
      payload: {
        id,
      },
    });
  };

  onUpdateStatus = info => {
    const { form } = this.props;
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      if (info.file.response.success) {
        form.setFieldsValue({ img: info.file.response.data });
      }
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  onNew = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'frame/add',
    });
  };

  render() {
    const { data, loading, form } = this.props;

    const uploadProps = {
      name: 'file',
      // multiple: true,
      withCredentials: true,
      action: '/api/file',
      // action:(file)=>{
      //   dispatch()
      // }
      accept: 'image/*',
      onChange: this.onUpdateStatus,
    };

    return data ? (
      <List.Item
        key={data.id}
        actions={[
          <Icon type="save" onClick={this.onSave} />,
          <Icon type="delete" onClick={this.onDelete} />,
        ]}
        loading={loading}
      >
        <Meta title={data.name} description={data.desc} />

        <Form layout="vertical">
          <Dragger {...uploadProps}>
            <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 50 }} label="画框图片">
              {form.getFieldDecorator('img', {
                rules: [{ required: true, message: '选择图片！' }],
                initialValue: data.img,
              })(<IDImage style={{ width: 200, height: 160 }} alt="画框" value={data.img} />)}
            </Form.Item>
          </Dragger>
          <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 50 }} label="序号">
            {form.getFieldDecorator('order', {
              rules: [{ required: true, message: '输入序号！' }],
              initialValue: data.order,
            })(<InputNumber placeholder="输入序号" />)}
          </Form.Item>
          <Form.Item>
            {form.getFieldDecorator('id', {
              rules: [{ required: false, message: '' }],
              initialValue: data.id,
            })(<input type="hidden" value={data.id} />)}
          </Form.Item>
        </Form>
      </List.Item>
    ) : (
      <List.Item>
        <Button type="dashed" className={styles.newButton} onClick={this.onNew}>
          <Icon type="plus" /> 新建
        </Button>
      </List.Item>
    );
  }
}

export default GiftFrameListItem;
