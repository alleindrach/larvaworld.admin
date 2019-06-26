import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import router from 'umi/router';
import { Dropdown, Card, Form, Input, Icon, Button, Menu } from 'antd';
import Audio from 'react-audioplayer';
import Highlighter from 'react-highlight-words';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './index.less';

const EditableContext = React.createContext();

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
// const statusMap = ['default', 'processing', 'success', 'error'];
// const status = ['关闭', '运行中', '已上线', '异常'];

/* eslint react/no-multi-comp:0 */
@connect(({ sounds, loading }) => ({
  sounds,
  loading: loading.models.sounds,
}))
@Form.create()
class SoundAudit extends PureComponent {
  state = {
    selectedRows: [],
    formValues: {},
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
      title: 'Talker',
      dataIndex: 'talker',
      sorter: true,
      inputType: 'text',
      filterOperator: 're',
      ...this.getColumnSearchProps('talker'),
      editable: true,
    },

    {
      title: 'Channel',
      dataIndex: 'channel',
      filterOperator: 'is',
      filters: [
        { text: '0', value: '0' },
        { text: '1', value: '1' },
        { text: '2', value: '2' },
        { text: '3', value: '3' },
      ],
      inputType: 'select',
      options: [
        { option: '0', key: '0' },
        { option: '1', key: '1' },
        { option: '2', key: '2' },
        { option: '3', key: '3' },
      ],
      editable: true,
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'auditStatus',
    //   filterOperator: 'is',
    //   filters: [
    //     { text: 'PENDING', value: 'PENDING' },
    //     { text: 'APPROVED', value: 'APPROVED' },
    //     { text: 'REJECTED', value: 'REJECTED' },
    //   ],
    //   inputType: 'select',
    //   options: [
    //     { option: 'PENDING', key: 'PENDING' },
    //     { option: 'APPROVED', key: 'APPROVED' },
    //     { option: 'REJECTED', key: 'REJECTED' },
    //   ],
    //   editable: true,
    // },
    {
      title: 'createDate',
      dataIndex: 'createDate',
      inputType: 'text',
      sorter: true,
      render: text => {
        return <span>{new Date(text).toLocaleDateString()}</span>;
      },
    },
    {
      title: 'Sound',
      render: (text, record) => {
        return <Audio width={80} playlist={[{ name: '', src: `/api/file/${record.snd}` }]} />;
      },
      fixed: 'right',
    },
    {
      title: 'Operation',
      render: (text, record) => {
        return (
          <span>
            <Icon
              type="close-circle"
              onClick={() => this.audit({ ids: [record.id], audit: false })}
              className={styles.operatorIcon}
            />
            <Icon
              type="check-circle"
              onClick={() => this.audit({ ids: [record.id], audit: true })}
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
    const { sounds } = this.props;

    dispatch({
      type: 'sounds/fetch',
      payload: {
        ...sounds.pagination,
      },
    });
  }

  audit = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sounds/audit',
      payload,
    });
  };

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
    filters.push({ key: 'auditStatus', op: 'is', val: 'PENDING' });
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
      type: 'sounds/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;

    dispatch({
      type: 'sounds/audit',
      payload: {
        ids: selectedRows.map(row => row.id),
        audit: e.key === 'approval',
      },
      callback: () => {
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  render() {
    const { sounds, loading, form } = this.props;
    const { selectedRows } = this.state;

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="approval">批量审批</Menu.Item>
        <Menu.Item key="reject">批量退审</Menu.Item>
      </Menu>
    );
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
          options: col.options,
        }),
      };
    });

    return (
      <PageHeaderWrapper
        title="声音列表"
        content={
          selectedRows.length > 0 && (
            <span>
              <Dropdown overlay={menu}>
                <Button>
                  批量操作 <Icon type="down" />
                </Button>
              </Dropdown>
            </span>
          )
        }
      >
        <Card bordered={false}>
          <div className={styles.tableList}>
            <EditableContext.Provider value={form}>
              <StandardTable
                selectedRows={selectedRows}
                loading={loading}
                data={sounds}
                columns={columns}
                onSelectRow={this.handleSelectRows}
                onChange={this.handleStandardTableChange}
                rowClassName={this.rowClassName}
                scroll={{ x: 1500 }}
              />
            </EditableContext.Provider>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SoundAudit;
