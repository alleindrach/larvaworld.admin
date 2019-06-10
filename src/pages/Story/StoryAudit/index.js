import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List } from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StoryCard from '@/components/StoryCard';

import styles from './index.less';

@connect(({ soundchannel, loading }) => ({
  soundchannel,
  loading: loading.models.soundchannel,
}))
class StoryAudit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'soundchannel/fetch',
      payload: {},
    });
  }

  render() {
    const {
      sounds: { list },
      loading,
    } = this.props;

    const content = <div className={styles.pageHeaderContent} />;

    const extraContent = null;

    return (
      <PageHeaderWrapper title="声音变变变审核" content={content} extraContent={extraContent}>
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={['', ...list]}
            renderItem={item => (
              <List.Item>
                <StoryCard data={item} />
              </List.Item>
            )}
          />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default StoryAudit;
