import { userlist, userSync, userAdd } from '@/services/api';
import resultErrorHandler from '../utils/resultErrorHandler';

export default {
  namespace: 'users',

  state: {
    editingkey: '',
    list: [],
    pagination: {
      current: 1,
      pageSize: 2,
      sorters: [],
      filters: [],
      total: 0,
    },
  },

  effects: {
    // *fetchCount({payload},{call,put,select}){
    //   const pagination = yield select(state => state.users.pagination);

    // },

    *fetch({ payload }, { call, put }) {
      // const pagination = yield select(state => state.users.pagination);
      const params = {
        from: (payload.current - 1) * payload.pageSize,
        size: payload.pageSize,
        sorters: payload.sorters,
        filters: payload.filters,
      };
      const response = yield call(userlist, params);
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({
          type: 'queryList',
          payload: { data: response.data, params: payload },
        });
      } else {
        yield put({
          type: 'queryList',
          payload: null,
        });
      }
    },
    *appendFetch({ payload }, { call, put, select }) {
      const users = yield select(state => state.users);
      const { current } = payload;
      let fromItem = current * users.pagination.pageSize;
      if (fromItem < users.list.length) fromItem = users.list.length;

      const params = {
        from: fromItem,
        size: users.pagination.pageSize,
        sorters: users.pagination.sorters,
        filters: users.pagination.filters,
      };
      const response = yield call(userlist, params);
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({
          type: 'appendList',
          payload: { data: response.data, params: payload },
        });
      }
    },

    *sync({ payload }, { call, put }) {
      const { record } = payload;
      const response = yield call(userSync, { ...record });
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({ type: 'clean', payload: response.data.id });
      }
    },
    *new({ payload }, { call, put }) {
      const { record } = payload;
      const response = yield call(userAdd, { ...record });
      yield call(resultErrorHandler, response);
      if (response.success) {
        yield put({ type: 'clean', payload: response.data.id });
      }
    },
    // *changeEnabled({payload},{put}){
    //   yield put({
    //     type:'changeEnabled',
    //     payload
    //   })
    // },
    // *changeAuthority({payload},{put}){
    //   yield put({
    //     tpe:'changeAuthority',
    //     payload
    //   })
    // }
    // *appendFetch({ payload }, { call, put }) {
    //   const response = yield call(queryFakeList, payload);
    //   yield put({
    //     type: 'appendList',
    //     payload: Array.isArray(response) ? response : [],
    //   });
    // },
    // *submit({ payload }, { call, put }) {
    //   let callback;
    //   if (payload.id) {
    //     callback = Object.keys(payload).length === 1 ? removeFakeList : updateFakeList;
    //   } else {
    //     callback = addFakeList;
    //   }
    //   const response = yield call(callback, payload); // post
    //   yield put({
    //     type: 'queryList',
    //     payload: response,
    //   });
    // },
  },

  reducers: {
    reset(state, action) {
      if (action.payload) {
        return {
          ...state,
          list: state.list.filter(item => item.id !== 'new'),
          pagination: {
            ...state.pagination,
            filters: action.payload.filters,
            sorters: action.payload.sorters,
            current: 0,
          },
          editingkey: '',
        };
      }
      return state;
    },
    queryList(state, action) {
      const newList = action.payload.data
        ? action.payload.data.list
            .filter(item => item.id !== 'new')
            .map(i => {
              return { ...i, key: i.id };
            })
        : [];

      return {
        ...state,
        list: newList,
        pagination: {
          ...state.pagination,
          ...action.payload.params,
          total: action.payload.data ? action.payload.data.count : 0,
        },
        editingkey: '',
      };
    },
    edit(state, action) {
      const newList = state.list.filter(item => item.id !== 'new');
      return {
        ...state,
        list: newList,
        editingkey: action.payload.key,
      };
    },
    add(state, action) {
      const newList = state.list.reduce((acc, item) => {
        if (item.id === action.payload.key) {
          return [
            ...acc,
            {
              id: 'new',
              key: 'new',
              username: '',
              mobile: '',
              role: 'ADULT',
              authorities: ['user'],
            },
            { ...item },
          ];
        }
        if (item.id === 'new') {
          return [...acc];
        }
        return [...acc, { ...item }];
      }, []);

      return {
        ...state,
        list: newList,
        editingkey: 'new',
      };
    },
    clean(state, action) {
      const id = action.payload;
      let dirt = 0;
      const newlist = state.list.map(item => {
        if (item.id === id) {
          return {
            ...item,
            dirt: 0,
          };
        }
        if (item.dirt === 1) dirt = 1;
        return item;
      });
      return {
        ...state,
        list: newlist,
        editingkey: '',
        dirt,
      };
    },
    changeEnabled(state, action) {
      const {
        enabled,
        record: { id },
      } = action.payload;
      let dirt = 0;
      const newlist = state.list.map(item => {
        if (item.id === id) {
          if (item.enabled !== enabled) {
            dirt = 1;
            return {
              ...item,
              enabled,
              dirt: 1,
            };
          }
        }
        return item;
      });

      return {
        ...state,
        list: newlist,
        dirt,
      };
    },
    changeAuthority(state, action) {
      const {
        authorities,
        record: { id },
      } = action.payload;
      const newAuthorities = authorities
        ? authorities
            .map(au => {
              return `ROLE_${au.toUpperCase()}`;
            })
            .sort((a, b) => (a > b ? 1 : -1))
        : [];
      let dirt = 0;
      const newlist = state.list.map(item => {
        if (item.id === id) {
          const curAuth = item.authorities
            ? item.authorities.sort((a, b) => (a > b ? 1 : -1)).join('')
            : '';
          const modiAuth = authorities ? authorities.sort((a, b) => (a > b ? 1 : -1)).join('') : '';
          if (curAuth !== modiAuth) {
            dirt = 1;
            return {
              ...item,
              authorities: newAuthorities,
              dirt: 1,
            };
          }
        }
        return item;
      });
      return {
        ...state,
        list: newlist,
        dirt,
      };
    },
    appendList(state, action) {
      const newList = action.payload.data
        ? action.payload.data.list.map(i => {
            return { ...i, key: i.id };
          })
        : [];
      return {
        ...state,
        list: {
          ...state.list,
          ...newList,
        },
        pagination: {
          ...state.pagination,
          current: action.payload.params.current,
        },
      };
    },
  },
};
