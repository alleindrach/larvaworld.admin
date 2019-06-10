import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List } from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import EditableSoundChannelCard from '@/components/EditableSoundChannelCard';

import styles from './index.less';

@connect(({ soundchannel, loading }) => ({
  soundchannel,
  loading: loading.models.soundchannel,
}))
class SoundChannel extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'soundchannel/fetch',
      payload: {},
    });
  }

  render() {
    const {
      soundchannel: { list },
      loading,
    } = this.props;

    const content = <div className={styles.pageHeaderContent} />;

    const extraContent = null;

    return (
      <PageHeaderWrapper title="声音变变变频道设置" content={content} extraContent={extraContent}>
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={['', ...list]}
            renderItem={item => (
              <List.Item>
                <EditableSoundChannelCard data={item} />
              </List.Item>
            )}
          />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default SoundChannel;
