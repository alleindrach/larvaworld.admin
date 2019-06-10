import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Steps,
  Radio,
  Switch,
  Popconfirm,
  Tag,
  Upload,
  Table,
} from 'antd';
import Highlighter from 'react-highlight-words';
import TagInlineSelectEditor from '@/components/TagInlineSelectEditor';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './index.less';

const EditableContext = React.createContext();

const { Dragger } = Upload;

class EditableCell extends React.Component {
  getInput = () => {
    const { inputType } = this.props;
    const { options } = this.props;
    if (inputType === 'number') {
      return <InputNumber />;
    }
    if (inputType === 'switch') {
      return <Switch checkedChildren="开" unCheckedChildren="关" />;
    }
    if (inputType === 'tags') {
      return (
        <TagInlineSelectEditor
          // onTagChanged={auths => this.handleAuthoritiesChanged(auths, record)}
          options={[
            <Option key="user">user</Option>,
            <Option key="admin">admin</Option>,
            <Option key="super">super</Option>,
            <Option key="none">none</Option>,
          ]}
        />
      );
    }
    if (inputType === 'select') {
      return (
        <Select>
          {options.map(op => (
            <Option key={op.key}>{op.option}</Option>
          ))}
        </Select>
      );
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      valuePropName,
      valueTrigger,
      record,
      index,
      children,
      converter,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: converter ? converter(record[dataIndex]) : record[dataIndex],
              valuePropName: valuePropName || 'value',
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
// const statusMap = ['default', 'processing', 'success', 'error'];
// const status = ['关闭', '运行中', '已上线', '异常'];

@Form.create()
class UserImportForm extends PureComponent {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      results: [],
    };
  }

  onUpdateStatus = info => {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      const resultList = info.file.response.data.map(item => {
        return { name: item.data.name, message: item.data.message, success: item.success };
      });
      this.setState({ results: [...resultList] });
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  okHandle = () => {
    const { form, handleModalVisible } = this.props;

    form.validateFields((
      err
      /* , fieldsValue */
    ) => {
      if (err) return;
      form.resetFields();
      handleModalVisible();
      // handleImport(fieldsValue);
    });
  };

  render() {
    const { modalVisible, form, handleModalVisible } = this.props;

    const resultColumns = [
      {
        title: '用户名',
        dataIndex: 'name',
        key: 'name',
      },
      // {
      //   title: 'ID',
      //   dataIndex: 'id',
      //   key: 'id',
      // },
      {
        title: '结果',
        dataIndex: 'success',
        key: 'success',
        render: value => {
          return value ? <Icon type="check" /> : <Icon type="close" />;
        },
      },
      {
        title: '备注',
        dataIndex: 'message',
        key: 'message',
      },
    ];

    const uploadProps = {
      name: 'file',
      // multiple: true,
      withCredentials: true,
      action: '/api/admin/user/import',
      // action:(file)=>{
      //   dispatch()
      // }
      accept: '.xls,.xlsx,.csv,.txt',
      onChange: this.onUpdateStatus,
    };
    const { results } = this.state;
    return (
      <Modal
        destroyOnClose
        title="导入"
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem>
          {form.getFieldDecorator('file', {
            rules: [{ required: false, message: '请选择文件！' }],
          })(
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data
                or other band files
              </p>
            </Dragger>
          )}
        </FormItem>
        {results && results.length > 0 ? (
          <FormItem>
            <Table dataSource={results} columns={resultColumns} className={styles.resultTable} />
          </FormItem>
        ) : null}
      </Modal>
    );
  }
}
// const UserImportForm = Form.create()(props => {
//   const { modalVisible, form, handleImport, handleModalVisible } = props;
//   const okHandle = () => {
//     form.validateFields((err, fieldsValue) => {
//       if (err) return;
//       form.resetFields();
//       handleImport(fieldsValue);
//     });
//   };

//   const uploadProps = {
//     name:'file',
//     // multiple: true,
//     withCredentials:true,
//     action:'/api/admin/user/import',
//     // action:(file)=>{
//     //   dispatch()
//     // }
//     accept:'.xls,.xlsx,.csv,.txt',
//     onChange: (info)=>{
//       const {status} = info.file;
//       if (status !== 'uploading') {
//         console.log(info.file, info.fileList);
//       }
//       if (status === 'done') {
//         message.success(`${info.file.name} file uploaded successfully.`);
//         const resultList=info.file.response.data.map(item=>
//           {
//             return {name:item.data.name,message:item.data.message,success:item.success}
//           }
//         )
//         this.setState({results:resultList})
//       } else if (status === 'error') {
//         message.error(`${info.file.name} file upload failed.`);
//       }
//     },
//   };
//   const resultColumns = [
//     {
//       title: '姓名',
//       dataIndex: 'name',
//       key: 'name',
//     },
//     {
//       title: 'ID',
//       dataIndex: 'id',
//       key: 'id',
//     },
//     {
//       title: '结果',
//       dataIndex: 'success',
//       key: 'success',
//     },
//     {
//       title: '备注',
//       dataIndex: 'message',
//       key: 'message',
//     },
//   ];

//   return (
//     <Modal
//       destroyOnClose
//       title="导入"
//       visible={modalVisible}
//       onOk={okHandle}
//       onCancel={() => handleModalVisible()}
//     >
//       <FormItem>
//         {form.getFieldDecorator('file', {
//           rules: [{ required: false, message: '请选择文件！'}],
//         })(
//           <Dragger {...uploadProps}>
//             <p className="ant-upload-drag-icon">
//               <Icon type="inbox" />
//             </p>
//             <p className="ant-upload-text">Click or drag file to this area to upload</p>
//             <p className="ant-upload-hint">
//               Support for a single or bulk upload. Strictly prohibit from uploading company data or other
//               band files
//             </p>
//           </Dragger>,

//         )}
//       </FormItem>

//     </Modal>
//   );
// });

@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        name: props.values.name,
        desc: props.values.desc,
        key: props.values.key,
        target: '0',
        template: '0',
        type: '1',
        time: '',
        frequency: 'month',
      },
      currentStep: 0,
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  handleNext = currentStep => {
    const { form, handleUpdate } = this.props;
    const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = { ...oldValue, ...fieldsValue };
      this.setState(
        {
          formVals,
        },
        () => {
          if (currentStep < 2) {
            this.forward();
          } else {
            handleUpdate(formVals);
          }
        }
      );
    });
  };

  backward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep - 1,
    });
  };

  forward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep + 1,
    });
  };

  renderContent = (currentStep, formVals) => {
    const { form } = this.props;
    if (currentStep === 1) {
      return [
        <FormItem key="target" {...this.formLayout} label="监控对象">
          {form.getFieldDecorator('target', {
            initialValue: formVals.target,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">表一</Option>
              <Option value="1">表二</Option>
            </Select>
          )}
        </FormItem>,
        <FormItem key="template" {...this.formLayout} label="规则模板">
          {form.getFieldDecorator('template', {
            initialValue: formVals.template,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">规则模板一</Option>
              <Option value="1">规则模板二</Option>
            </Select>
          )}
        </FormItem>,
        <FormItem key="type" {...this.formLayout} label="规则类型">
          {form.getFieldDecorator('type', {
            initialValue: formVals.type,
          })(
            <RadioGroup>
              <Radio value="0">强</Radio>
              <Radio value="1">弱</Radio>
            </RadioGroup>
          )}
        </FormItem>,
      ];
    }
    if (currentStep === 2) {
      return [
        <FormItem key="time" {...this.formLayout} label="开始时间">
          {form.getFieldDecorator('time', {
            rules: [{ required: true, message: '请选择开始时间！' }],
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间"
            />
          )}
        </FormItem>,
        <FormItem key="frequency" {...this.formLayout} label="调度周期">
          {form.getFieldDecorator('frequency', {
            initialValue: formVals.frequency,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="month">月</Option>
              <Option value="week">周</Option>
            </Select>
          )}
        </FormItem>,
      ];
    }
    return [
      <FormItem key="name" {...this.formLayout} label="用户名">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入用户名！' }],
          initialValue: formVals.name,
        })(<Input placeholder="请输入" />)}
      </FormItem>,
      <FormItem key="desc" {...this.formLayout} label="规则描述">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: '请输入至少五个字符的规则描述！', min: 5 }],
          initialValue: formVals.desc,
        })(<TextArea rows={4} placeholder="请输入至少五个字符" />)}
      </FormItem>,
    ];
  };

  renderFooter = currentStep => {
    const { handleUpdateModalVisible, values } = this.props;
    if (currentStep === 1) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
          取消
        </Button>,
        <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
          下一步
        </Button>,
      ];
    }
    if (currentStep === 2) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => this.handleNext(currentStep)}>
          完成
        </Button>,
      ];
    }
    return [
      <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
        取消
      </Button>,
      <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
        下一步
      </Button>,
    ];
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
    const { currentStep, formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="规则配置"
        visible={updateModalVisible}
        footer={this.renderFooter(currentStep)}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
      >
        <Steps style={{ marginBottom: 28 }} size="small" current={currentStep}>
          <Step title="基本信息" />
          <Step title="配置规则属性" />
          <Step title="设定调度周期" />
        </Steps>
        {this.renderContent(currentStep, formVals)}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ users, loading }) => ({
  users,
  loading: loading.models.users,
}))
@Form.create()
class UserList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
  };

  // eslint-disable-next-line react/sort-comp
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleHeaderSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleHeaderSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleHeaderReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? 'red' : 'balck' }} />,
    // onFilter: (value, record) =>
    //   record[dataIndex]
    //     .toString()
    //     .toLowerCase()
    //     .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => {
      const { searchText } = this.state;
      return (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      );
    },
  });

  columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      sorter: true,
      inputType: 'text',
      filterOperator: 're',
      ...this.getColumnSearchProps('username'),
      editable: true,
    },
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   render: text => <a onClick={() => this.previewItem(text)}>{text}</a>,
    // },
    {
      title: 'Role',
      dataIndex: 'role',
      filterOperator: 'is',
      filters: [{ text: 'ADULT', value: 'ADULT' }, { text: 'KID', value: 'KID' }],
      inputType: 'select',
      options: [{ option: 'ADULT', key: 'ADULT' }, { option: 'KID', key: 'KID' }],
      editable: true,
    },
    {
      title: 'Phone',
      dataIndex: 'mobile',
      inputType: 'number',
      editable: true,
      filterOperator: 're',
      ...this.getColumnSearchProps('mobile'),
    },
    {
      title: 'Partner',
      dataIndex: 'curPartner',
      render: text => {
        if (text) {
          const partner = JSON.parse(text);
          if (partner) return <a onClick={() => this.selectItem(partner.id)}>{partner.username}</a>;
        }
        return null;
      },
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      inputType: 'switch',

      editable: true,
      converter: v => {
        return v === 1;
      },
      valuePropName: 'checked',
      sorter: true,
      render: value => {
        return (
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            defaultChecked={value === 1}
            disabled
          />
        );
      },
      filterOperator: '==',
      filters: [{ text: 'Enabled', value: '1' }, { text: 'Disabled', value: '0' }],
    },
    {
      title: 'Authorities',
      key: 'authorities',
      dataIndex: 'authorities',
      editable: true,
      inputType: 'tags',

      render: authorities => (
        <div>
          {authorities.map(authority => (
            <Tag color={authority.match(/ADMIN/) ? 'volcano' : 'green'}>
              {authority.replace(/ROLE_(\w*)/, (m, p1) => {
                return p1.toLowerCase();
              })}
            </Tag>
          ))}
        </div>
      ),
      filterOperator: 'has',
      filters: [
        { text: 'user', value: 'user' },
        { text: 'admin', value: 'admin' },
        { text: 'super', value: 'super' },
      ],
    },
    {
      title: 'Operation',
      render: (text, record) => {
        const {
          users: { editingkey },
        } = this.props;
        const editable = this.isEditing(record);
        return editable ? (
          <span>
            <EditableContext.Consumer>
              {form => (
                <Icon
                  // eslint-disable-next-line no-script-url
                  type="check"
                  color="green"
                  onClick={() => this.save(form, record.key)}
                  style={{ marginRight: 8 }}
                />
              )}
            </EditableContext.Consumer>
            <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
              <Icon color="red" type="close" />
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Icon
              type="edit"
              disabled={editingkey !== ''}
              onClick={() => this.edit(record.key)}
              className={styles.operatorIcon}
            />
            <Icon
              type="plus"
              disabled={editingkey !== ''}
              onClick={() => this.add(record.key)}
              className={styles.operatorIcon}
            />
          </span>
        );
      },
      fixed: 'right',
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    const { users } = this.props;
    dispatch({
      type: 'users/fetch',
      payload: {
        ...users.pagination,
      },
    });
  }

  isEditing = record => {
    const {
      users: { editingkey },
    } = this.props;
    return record.key === editingkey;
  };

  cancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'users/edit',
      payload: { key: '' },
    });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }

      const {
        users: { list },
        dispatch,
      } = this.props;

      const newData = [...list];
      const index = newData.findIndex(item => key === item.key);
      const record = {
        ...row,
        id: key,
        enabled: row.enabled ? 1 : 0,
      };
      if (index > -1 && key !== 'new') {
        // const item = newData[index];
        // newData.splice(index, 1, {
        //   ...item,
        //   ...row,
        // });

        dispatch({
          type: 'users/sync',
          payload: { record },
        });
        // 更新
      } else {
        dispatch({
          type: 'users/new',
          payload: { record },
        });
      }
    });
  }

  edit(key) {
    const { dispatch } = this.props;
    const {
      users: { editingkey },
    } = this.props;
    if (editingkey === '') {
      dispatch({
        type: 'users/edit',
        payload: { key },
      });
    }
  }

  add(key) {
    const {
      users: { editingkey },
    } = this.props;
    const { dispatch } = this.props;
    if (editingkey === '') {
      dispatch({
        type: 'users/add',
        payload: { key },
      });
    }
  }

  handleHeaderSearch = (selectedKeys, confirm) => {
    confirm();
    // const newState=new Array;
    // newState[`${dataIndex}_searchText`]=selectedKeys[0];
    this.setState({
      searchText: selectedKeys[0],
    });
  };

  handleHeaderReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const column = this.columns.find(x => x.dataIndex === key);

      const op = column.filterOperator || 're';
      if (filtersArg[key].length > 0) {
        const newObj = [
          ...obj,
          {
            key,
            op,
            val: getValue(filtersArg[key]),
          },
        ];
        return newObj;
      }
      return obj;
    }, []);
    const sorters = sorter.field
      ? [
          {
            key: sorter.field,
            dir: sorter.order,
          },
        ]
      : [];

    const params = {
      ...pagination,
      ...formValues,
      filters,
      sorters,
    };

    dispatch({
      type: 'users/fetch',
      payload: params,
    });
  };

  previewItem = id => {
    router.push(`/profile/basic/${id}`);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'users/fetch',
      payload: { pageSize: 10, current: 0, filters: [], sorters: [] },
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'users/remove',
          payload: {
            key: selectedRows.map(row => row.key),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        // updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      const filters = {
        ...fieldsValue,
      };
      dispatch({
        type: 'users/fetch',
        payload: {
          current: 0,
          pageSize: 10,
          filters,
          sorters: [],
        },
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleAuthoritiesChanged = (authorities, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'users/changeAuthority',
      payload: { record, authorities },
    });
  };

  handleEnabledChanged = (checked, record) => {
    const { dispatch } = this.props;
    const enabled = checked ? 1 : 0;
    dispatch({
      type: 'users/changeEnabled',
      payload: { record, enabled },
    });
  };

  handleUserSync = record => {
    const { dispatch } = this.props;
    dispatch({
      type: 'users/sync',
      payload: { record },
    });
  };

  handleImport = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'users/add',
      payload: {
        desc: fields.desc,
      },
    });

    message.success('导入成功');
    this.handleModalVisible();
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
    dispatch({
      type: 'users/update',
      payload: {
        query: formValues,
        body: {
          name: fields.name,
          desc: fields.desc,
          key: fields.key,
        },
      },
    });

    message.success('配置成功');
    this.handleUpdateModalVisible();
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="用户状态">
              {getFieldDecorator('enabled')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">有效</Option>
                  <Option value="0">禁止中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="用户状态">
              {getFieldDecorator('enabled')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">有效</Option>
                  <Option value="0">禁止中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="电话号码">
              {getFieldDecorator('mobile')(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  // rowClassName=(record)=>{
  //     if(record.dirt)
  //     {
  //       return styles.rowDirt
  //     }
  //     return styles.rowClean
  // }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const { users, loading, form } = this.props;
    const { selectedRows, modalVisible, updateModalVisible, stepFormValues } = this.state;

    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.inputType,
          dataIndex: col.dataIndex,
          converter: col.converter,
          valuePropName: col.valuePropName,
          title: col.title,
          editing: this.isEditing(record),
          options: col.options,
        }),
      };
    });

    const parentMethods = {
      handleImport: this.handleImport,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <PageHeaderWrapper
        title="用户列表"
        content={
          <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
            导入
          </Button>
        }
      >
        <Card bordered={false}>
          <div className={styles.tableList}>
            <EditableContext.Provider value={form}>
              <StandardTable
                components={components}
                selectedRows={selectedRows}
                loading={loading}
                data={users}
                columns={columns}
                onSelectRow={this.handleSelectRows}
                onChange={this.handleStandardTableChange}
                rowClassName={this.rowClassName}
                scroll={{ x: 1500 }}
              />
            </EditableContext.Provider>
          </div>
        </Card>
        <UserImportForm {...parentMethods} modalVisible={modalVisible} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default UserList;
