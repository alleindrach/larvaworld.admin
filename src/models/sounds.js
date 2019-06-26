import { soundChannelList, soundList, soundAudit } from '@/services/api';

import resultErrorHandler from '../utils/resultErrorHandler';

export default {
  namespace: 'sounds',

  state: {
    list: [],
    channel: [],
    pagination: {
      current: 1,
      pageSize: 20,
      sorters: [],
      filters: [{ key: 'auditStatus', op: 'is', val: 'PENDING' }],
      total: 0,
    },
  },

  effects: {
    *fetch({ payload }, { all, call, put }) {
      const params = {
        from: (payload.current - 1) * payload.pageSize,
        size: payload.pageSize,
        sorters: payload.sorters,
        filters: payload.filters,
        repo: 1,
        type: 0,
      };
      const [channel, msgs] = yield all([call(soundChannelList), call(soundList, params)]);
      yield call(resultErrorHandler, channel);
      yield call(resultErrorHandler, msgs);
      if (channel.success) {
        yield put({
          type: 'channel',
          payload: channel.data,
        });
      } else {
        yield put({
          type: 'channel',
          payload: [],
        });
      }

      if (msgs.success) {
        yield put({
          type: 'list',
          payload: { data: msgs.data, params: payload },
        });
      } else {
        yield put({
          type: 'list',
          payload: [],
        });
      }
    },

    *audit({ payload }, { call, put }) {
      const response = yield call(soundAudit, payload);
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({
          type: 'change',
          payload: response.data,
        });
      } else {
        yield put({
          type: 'change',
          payload: [],
        });
      }
    },
  },

  reducers: {
    channel(state, action) {
      return {
        ...state,
        channel: action.payload.sort((x, y) => (x.index < y.index ? 1 : -1)),
      };
    },
    list(state, action) {
      return {
        ...state,
        list: action.payload.data
          ? action.payload.data.list.map(item => {
              const filterChannels = state.channel.filter(x => x.index === item.channel);
              if (filterChannels && filterChannels.size > 0) {
                return { ...item, talker: item.talker.username, img: filterChannels[0].img };
              }

              return { ...item, talker: item.talker.username, img: undefined };
            })
          : [],
        pagination: {
          ...state.pagination,
          ...action.payload.params,
          total: action.payload.data ? action.payload.data.count : 0,
        },
      };
    },

    change(state, action) {
      const changed = action.payload.map(item => {
        const imgid = state.channel.filter(x => x.index === item.channel)[0].img;
        return { ...item, img: imgid };
      });

      const filteed = state.list.map(item => {
        const f = changed.filter(x => x.id === item.id);
        if (f) return f[0];
        return item;
      });

      return {
        ...state,
        list: filteed,
      };
    },
  },
};
