import { notification } from 'antd';
import { routerRedux } from 'dva/router';
import { clearAuthority } from './authority';

const resultErrorHandler = result => {
  if (result.state !== 1) {
    notification.error({
      message: `请求错误 ${result.reason}`,
      description: '',
    });
    if (result.reason.match(/^00000\d/)) {
      clearAuthority();
      const redirect = encodeURIComponent(window.location.href);
      routerRedux.replace(`/user/login?redirect=${redirect}`);
    }
  }
  // return result;
};
export default resultErrorHandler;
