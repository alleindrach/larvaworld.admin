import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List } from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import GiftFrameListItem from '@/components/GiftFrameListItem';

import styles from './index.less';
//
// const slides = {
//   list:[],
//   pagination: {
//     current: 1,
//     pageSize: 5,
//     sorters: [],
//     filters: [{ key: 'auditStatus', op: 'is', val: 'COMPLAINT' }],
//     total: 100,
//   }
// };
// // eslint-disable-next-line no-plusplus
// for (let i = 0; i < 23; i++) {
//   slides.list.push({
//     id: i,
//     name: `ant design part ${i}`,
//     desc:
//       'Ant Design, a design language for background applications, is refined by Ant UED Team.',
//     comment:
//       'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
//     scenes:[
//       {
//         src:'/api/file/5cd623d69a3782099aa32748',
//         img:'/api/file/5cd431e5c8543526efb49230',
//       },
//       {
//         snd:'/api/file/5cd686a39a3782099aa3275a',
//         img:'/api/file/5cd431e5c8543526efb49233',
//       }
//     ]
//   });
// }

@connect(({ frame, loading }) => ({
  frame,
  loading: loading.models.frame,
}))
class Frame extends PureComponent {
  componentDidMount() {
    const { frame, dispatch } = this.props;
    dispatch({
      type: 'frame/fetch',
      payload: {
        ...frame.pagination,
        from: 0,
        size: frame.pagination.pageSize,
        filters: [{ key: 'deleted', op: 'is', val: 'false' }],
      },
    });
  }

  render() {
    const { frame, loading, dispatch } = this.props;

    const content = <div className={styles.pageHeaderContent} />;

    const extraContent = null;

    return (
      <PageHeaderWrapper title="分享爱-相框" content={content} extraContent={extraContent}>
        <div className={styles.cardList}>
          <List
            itemLayout="vertical"
            size="large"
            pagination={{
              onChange: (page, pageSize) => {
                while (page * pageSize > frame.list.length) {
                  const fromIndex = frame.list.length;
                  const toIndex = page * pageSize;
                  const size = toIndex - fromIndex + 1;
                  dispatch({
                    type: 'frame/fetch',
                    payload: {
                      from: (page - 1) * pageSize,
                      size,
                      filters: [],
                    },
                  });
                }
                // this.current=page;
                console.log(page);
              },
              pageSize: frame.pagination.pageSize,
              // current:slides.pagination.current,
              total: frame.pagination.total,
            }}
            rowKey="id"
            loading={loading}
            // grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={['', ...frame.list]}
            renderItem={item => <GiftFrameListItem data={item} />}
          />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Frame;