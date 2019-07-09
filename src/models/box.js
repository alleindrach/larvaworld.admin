import { boxList, boxSet, boxDelete } from '@/services/api';

import resultErrorHandler from '../utils/resultErrorHandler';

export default {
  namespace: 'box',

  state: {
    list: [],
    pagination: {
      current: 1,
      pageSize: 5,
      sorters: [],
      filters: [{ key: 'deleted', op: 'is', val: 'false' }],
      total: 0,
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(boxList, payload);
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({
          type: 'list',
          payload: response.data.list,
        });
      } else {
        yield put({
          type: 'list',
          payload: [],
        });
      }
    },
    *delete({ payload }, { call, put }) {
      const response = yield call(boxDelete, payload.id);
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({
          type: 'remove',
          payload: payload.id,
        });
      }
    },

    *update({ payload }, { call, put }) {
      const response = yield call(boxSet, payload);
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({
          type: 'set',
          payload: {
            ...response.data,
            new: !payload.id,
          },
        });
        yield put({
          type: 'edit',
          payload: { id: response.data.id, editing: false },
        });
      } else {
        // yield put({
        //   type: 'set',
        //   payload: [],
        // });
      }
    },
  },

  reducers: {
    set(state, action) {
      const newList = state.list.reduce((acc, item) => {
        if (item.id === action.payload.id) {
          return [
            ...acc,
            {
              ...item,
              ...action.payload,
            },
          ];
        }
        if (action.payload.new && item.order === action.payload.order) {
          return [...acc, { ...item, ...action.payload, editing: false, new: false }];
        }
        return [...acc, item];
      }, []);
      return {
        ...state,
        list: newList,
      };
    },
    list(state, action) {
      return {
        ...state,
        list: action.payload.sort((x, y) => (x.order < y.order ? 1 : -1)),
      };
    },
    remove(state, action) {
      return {
        ...state,
        list: state.list.filter(x => x.id !== action.payload),
      };
    },
    add(state) {
      if (state.list.length > 0) {
        const appendIndex = state.list[0].order + 1;

        return {
          ...state,
          list: [
            { img: null, name: '', order: appendIndex, desc: '', editing: true, new: true },
            ...state.list,
          ],
        };
      }
      return {
        ...state,
        list: [{ img: null, name: '', order: 0, desc: '', editing: true, new: true }],
      };
    },

    edit(state, action) {
      const newList = state.list
        .map(item => {
          if (item.id === action.payload.id) {
            return {
              ...item,
              editing: action.payload.editing,
            };
          }
          return item;
        })
        .filter(x => !x.new);

      return {
        ...state,
        list: newList,
      };
    },
  },
};
