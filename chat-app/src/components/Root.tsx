import React from 'react';
import { Spinner } from '@blueprintjs/core';
import styled from 'styled-components';

const SpinnerWrapper = styled.div`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const Root = () => {
  return (
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  );
};

export default Root;
