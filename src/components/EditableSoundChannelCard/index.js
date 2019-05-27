import React, { Component } from 'react';
// import { connect } from 'dva';
import { Card, Button, Icon, Form, InputNumber, Upload, Input, Popconfirm, message } from 'antd';
import IDImage from '@/components/IDImage';
import { connect } from 'dva';
import styles from './index.less';

const { Meta } = Card;

const { Dragger } = Upload;
@connect(({ soundchannel, loading }) => ({
  soundchannel,
  loading: loading.models.soundchannel,
}))
@Form.create()
class EditableSoundChannelCard extends Component {
  // class EditableSoundChannelCard extends Component {

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

  onDelete = () => {
    const {
      data: { id },
      dispatch,
    } = this.props;
    dispatch({
      type: 'soundchannel/delete',
      payload: {
        id,
      },
    });
  };

  onEdit = () => {
    const {
      data: { id },
      dispatch,
    } = this.props;
    dispatch({
      type: 'soundchannel/edit',
      payload: {
        id,
        editing: true,
      },
    });
  };

  onSave = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      dispatch({
        type: 'soundchannel/update',
        payload: {
          ...fieldsValue,
        },
      });
      // handleImport(fieldsValue);
    });
  };

  onCancel = () => {
    const {
      data: { id },
      dispatch,
    } = this.props;
    dispatch({
      type: 'soundchannel/edit',
      payload: {
        id,
        editing: false,
      },
    });
  };

  onNewChannel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'soundchannel/add',
    });
  };

  render() {
    const { data, form, loading } = this.props;
    const {
      data: { editing },
    } = this.props;
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
      <Card
        style={{ width: 300 }}
        loading={loading}
        cover={editing ? null : <IDImage alt="channel background" value={data.img} />}
        actions={
          editing
            ? [
                // eslint-disable-next-line react/jsx-indent
                <Icon type="save" onClick={this.onSave} />,
                // eslint-disable-next-line react/jsx-indent
                <Popconfirm title="Sure to cancel?" onConfirm={this.onCancel}>
                  <Icon type="close-circle" />
                </Popconfirm>,
              ]
            : [
                // eslint-disable-next-line react/jsx-indent
                <Icon type="edit" onClick={this.onEdit} />,
                // eslint-disable-next-line react/jsx-indent
                <Icon type="delete" onClick={this.onDelete} />,
              ]
        }
      >
        {editing ? (
          <Form layout="horizontal">
            <Dragger {...uploadProps}>
              <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 50 }} label="名称">
                {form.getFieldDecorator('img', {
                  rules: [{ required: true, message: '选择图片！' }],
                  initialValue: data.img,
                })(
                  <IDImage
                    style={{ width: 200, height: 160 }}
                    alt="channel background"
                    value={data.img}
                  />
                )}
              </Form.Item>
            </Dragger>
            <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 50 }} label="序号">
              {form.getFieldDecorator('index', {
                rules: [{ required: true, message: '输入序号！' }],
                initialValue: data.index,
              })(<InputNumber placeholder="输入序号" />)}
            </Form.Item>
            <Form.Item labelCol={{ span: 5 }} wrapperCol={{ span: 50 }} label="名称">
              {form.getFieldDecorator('name', {
                rules: [{ required: true, message: '输入名称！' }],
                initialValue: data.name,
              })(<Input placeholder="输入名称" />)}
            </Form.Item>
            <Form.Item>
              {form.getFieldDecorator('id', {
                rules: [{ required: false, message: '选择ID！' }],
                initialValue: data.id,
              })(<input type="hidden" value={data.id} />)}
            </Form.Item>
          </Form>
        ) : (
          <Meta title={`${data.index} ${data.name}`} description={data.desc} />
        )}
      </Card>
    ) : (
      <Button type="dashed" className={styles.newButton} onClick={this.onNewChannel}>
        <Icon type="plus" /> 新建频道
      </Button>
    );
  }
}

export default EditableSoundChannelCard;
