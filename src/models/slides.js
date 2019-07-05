import { storyList, storyAudit } from '@/services/api';

import resultErrorHandler from '../utils/resultErrorHandler';
import appConfig from '../config/app.config';

export default {
  namespace: 'slides',

  state: {
    list: [],
    channel: [],
    pagination: {
      current: 1,
      pageSize: 5,
      sorters: [],
      filters: [{ key: 'auditStatus', op: 'is', val: 'COMPLAINT' }],
      total: 0,
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const params = {
        from: payload.from,
        size: payload.size,
        sorters: payload.sorters,
        filters: payload.filters,
        repo: 1,
        type: 1,
      };
      const msgs = yield call(storyList, params);
      yield call(resultErrorHandler, msgs);

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
      const response = yield call(storyAudit, payload);
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
              return {
                ...item,
                talker: item.talker.username,
                scenes: item.scenes.map(scene => {
                  return {
                    src: appConfig.api.filebase + scene.snd,
                    img: appConfig.api.filebase + scene.img,
                  };
                }),
              };
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
        list: filteed
          .map(item => {
            return {
              ...item,
              talker: item.talker.username,
              scenes: item.scenes.map(scene => {
                return {
                  src: appConfig.api.filebase + scene.snd,
                  img: appConfig.api.filebase + scene.img,
                };
              }),
            };
          })
          .filter(item => item.auditStatus === 'COMPLAINT'),
      };
    },
  },
};
