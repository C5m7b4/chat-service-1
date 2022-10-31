import {
  Card,
  Classes,
  Elevation,
  FormGroup,
  InputGroup,
  Intent,
  Button,
} from "@blueprintjs/core";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import useGeneratedId from "#root/utils/hooks/forms/useGeneratedId";

interface FormData {
  password: string;
  username: string;
}

const Form = styled.form`
  margin: auto;
  width: 25rem;
`;

const Heading = styled.strong.attrs({ className: Classes.HEADING })`
  display: block;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
`;

// @ts-ignore
const LargeFormGroup = styled(FormGroup)`
  .bp3-label {
    font-size: 1rem;
  }
`;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const Login = () => {
  const { handleSubmit, register, watch } = useForm<FormData>();
  const generateId = useGeneratedId();

  const onSubmit = ({ password, username }: FormData) => {
    alert(`username is ${username} and password id ${password}`);
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card elevation={Elevation.TWO}>
          <Heading>Chat App</Heading>
          <LargeFormGroup label="Username" labelFor={generateId("username")}>
            <InputGroup
              autoFocus
              id={generateId("username")}
              large
              {...register("username")}
            />
          </LargeFormGroup>
          <LargeFormGroup label="Password" labelFor={generateId("password")}>
            <InputGroup
              large
              type="password"
              id={generateId("password")}
              {...register("password")}
            />
          </LargeFormGroup>
          <Button intent={Intent.PRIMARY} large type="submit">
            Login
          </Button>
        </Card>
        <pre>{JSON.stringify(watch(), null, 2)}</pre>
      </Form>
    </Wrapper>
  );
};

export default Login;
