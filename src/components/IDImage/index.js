import React from 'react';

const IDImage = ({ alt, value, ...other }) => (
  <img alt={alt} src={`\\api\\file\\${value}`} {...other} />
);

export default IDImage;
